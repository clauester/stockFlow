using Dapper;
using StockFlow.core.entities;
using StockFlow.core.exceptions;
using StockFlow.infrastructure.database;
using StockFlow.shared;

namespace StockFlow.features.inventory;

// servicio que maneja toda la lógica de productos y lotes usando dapper
public class InventoryService : IInventoryService
{
    private readonly DbConnectionFactory _db;
    private readonly ILogger<InventoryService> _logger;

    public InventoryService(DbConnectionFactory db, ILogger<InventoryService> logger)
    {
        _db     = db;
        _logger = logger;
    }

    public async Task<PaginatedResult<ProductResponse>> GetAllAsync(
        int page, int pageSize, string? name, string? category, string? sku)
    {
        using var conn = _db.Create();

        var condiciones = new List<string> { "p.is_active = TRUE" };
        var parametros  = new DynamicParameters();

        if (!string.IsNullOrWhiteSpace(name))
        {
            condiciones.Add("p.name ILIKE @Name");
            parametros.Add("Name", $"%{name}%");
        }
        if (!string.IsNullOrWhiteSpace(category))
        {
            condiciones.Add("p.category ILIKE @Category");
            parametros.Add("Category", $"%{category}%");
        }
        if (!string.IsNullOrWhiteSpace(sku))
        {
            condiciones.Add("p.sku ILIKE @Sku");
            parametros.Add("Sku", $"%{sku}%");
        }

        var where  = string.Join(" AND ", condiciones);
        var offset = (page - 1) * pageSize;

        parametros.Add("Limit",  pageSize);
        parametros.Add("Offset", offset);

        var total = await conn.ExecuteScalarAsync<int>(
            $"SELECT COUNT(*) FROM products p WHERE {where}", parametros);

        var sql = $@"
            SELECT p.*, l.id, l.product_id, l.lot_number, l.price, l.entry_date, l.quantity, l.notes
            FROM products p
            LEFT JOIN product_lots l ON l.product_id = p.id
            WHERE {where}
            ORDER BY p.created_at DESC
            LIMIT @Limit OFFSET @Offset";

        var dict = new Dictionary<Guid, ProductResponse>();

        await conn.QueryAsync<Product, ProductLot, Product>(
            sql,
            (product, lot) =>
            {
                if (!dict.TryGetValue(product.Id, out var existente))
                {
                    existente = MapearProducto(product);
                    dict[product.Id] = existente;
                }
                if (lot is not null && lot.Id != Guid.Empty)
                    existente.Lots.Add(MapearLote(lot));
                return product;
            },
            parametros,
            splitOn: "id");

        return new PaginatedResult<ProductResponse>
        {
            Data       = dict.Values.ToList(),
            TotalCount = total,
            Page       = page,
            PageSize   = pageSize
        };
    }

    public async Task<ProductResponse?> GetByIdAsync(Guid id)
    {
        using var conn = _db.Create();

        var sql = @"
            SELECT p.*, l.id, l.product_id, l.lot_number, l.price, l.entry_date, l.quantity, l.notes
            FROM products p
            LEFT JOIN product_lots l ON l.product_id = p.id
            WHERE p.id = @Id AND p.is_active = TRUE";

        ProductResponse? resultado = null;

        await conn.QueryAsync<Product, ProductLot, Product>(
            sql,
            (product, lot) =>
            {
                resultado ??= MapearProducto(product);
                if (lot is not null && lot.Id != Guid.Empty)
                    resultado.Lots.Add(MapearLote(lot));
                return product;
            },
            new { Id = id },
            splitOn: "id");

        return resultado;
    }

    public async Task<ProductResponse> CreateAsync(CreateProductRequest request)
    {
        using var conn = _db.Create();

        var skuExiste = await conn.ExecuteScalarAsync<bool>(
            "SELECT EXISTS(SELECT 1 FROM products WHERE sku = @Sku)", new { request.Sku });

        if (skuExiste)
            throw new ConflictException($"Ya existe un producto con el SKU '{request.Sku}'.");

        var id  = Guid.NewGuid();
        var now = DateTime.UtcNow;

        await conn.ExecuteAsync(@"
            INSERT INTO products (id, name, description, category, sku, stock, is_active, created_at, updated_at)
            VALUES (@Id, @Name, @Description, @Category, @Sku, @Stock, TRUE, @Now, @Now)",
            new { Id = id, request.Name, request.Description, request.Category, request.Sku, request.Stock, Now = now });

        _logger.LogInformation("Producto creado: {Name} (SKU: {Sku})", request.Name, request.Sku);

        return (await GetByIdAsync(id))!;
    }

    public async Task<ProductResponse> UpdateAsync(Guid id, UpdateProductRequest request)
    {
        using var conn = _db.Create();

        var existente = await conn.QuerySingleOrDefaultAsync<Product>(
            "SELECT * FROM products WHERE id = @Id AND is_active = TRUE", new { Id = id });

        if (existente is null)
            throw new NotFoundException("Producto", id);

        var skuConflicto = await conn.ExecuteScalarAsync<bool>(
            "SELECT EXISTS(SELECT 1 FROM products WHERE sku = @Sku AND id <> @Id)", new { request.Sku, Id = id });

        if (skuConflicto)
            throw new ConflictException($"El SKU '{request.Sku}' ya está en uso por otro producto.");

        await conn.ExecuteAsync(@"
            UPDATE products
            SET name = @Name, description = @Description, category = @Category,
                sku = @Sku, stock = @Stock, updated_at = @Now
            WHERE id = @Id",
            new { request.Name, request.Description, request.Category, request.Sku, request.Stock, Now = DateTime.UtcNow, Id = id });

        _logger.LogInformation("Producto actualizado: {Id}", id);

        return (await GetByIdAsync(id))!;
    }

    public async Task DeleteAsync(Guid id)
    {
        using var conn = _db.Create();

        var filas = await conn.ExecuteAsync(
            "UPDATE products SET is_active = FALSE, updated_at = @Now WHERE id = @Id AND is_active = TRUE",
            new { Id = id, Now = DateTime.UtcNow });

        if (filas == 0)
            throw new NotFoundException("Producto", id);

        _logger.LogInformation("Producto eliminado (soft delete): {Id}", id);
    }

    public async Task<List<LotResponse>> GetLotsAsync(Guid productId)
    {
        using var conn = _db.Create();

        await VerificarProductoExisteAsync(conn, productId);

        var lotes = await conn.QueryAsync<ProductLot>(
            "SELECT * FROM product_lots WHERE product_id = @ProductId ORDER BY entry_date DESC",
            new { ProductId = productId });

        return lotes.Select(MapearLote).ToList();
    }

    public async Task<LotResponse> CreateLotAsync(Guid productId, CreateLotRequest request)
    {
        using var conn = _db.Create();

        await VerificarProductoExisteAsync(conn, productId);

        var loteExiste = await conn.ExecuteScalarAsync<bool>(
            "SELECT EXISTS(SELECT 1 FROM product_lots WHERE lot_number = @LotNumber)",
            new { request.LotNumber });

        if (loteExiste)
            throw new ConflictException($"El número de lote '{request.LotNumber}' ya existe.");

        var id = Guid.NewGuid();

        await conn.ExecuteAsync(@"
            INSERT INTO product_lots (id, product_id, lot_number, price, entry_date, quantity, notes)
            VALUES (@Id, @ProductId, @LotNumber, @Price, @EntryDate, @Quantity, @Notes)",
            new { Id = id, ProductId = productId, request.LotNumber, request.Price, request.EntryDate, request.Quantity, request.Notes });

        _logger.LogInformation("Lote creado: {LotNumber} para producto {ProductId}", request.LotNumber, productId);

        var lote = await conn.QuerySingleAsync<ProductLot>(
            "SELECT * FROM product_lots WHERE id = @Id", new { Id = id });

        return MapearLote(lote);
    }

    public async Task<LotResponse> UpdateLotAsync(Guid productId, Guid lotId, UpdateLotRequest request)
    {
        using var conn = _db.Create();

        await VerificarProductoExisteAsync(conn, productId);

        var lote = await conn.QuerySingleOrDefaultAsync<ProductLot>(
            "SELECT * FROM product_lots WHERE id = @Id AND product_id = @ProductId",
            new { Id = lotId, ProductId = productId });

        if (lote is null)
            throw new NotFoundException("Lote", lotId);

        var loteConflicto = await conn.ExecuteScalarAsync<bool>(
            "SELECT EXISTS(SELECT 1 FROM product_lots WHERE lot_number = @LotNumber AND id <> @Id)",
            new { request.LotNumber, Id = lotId });

        if (loteConflicto)
            throw new ConflictException($"El número de lote '{request.LotNumber}' ya está en uso.");

        await conn.ExecuteAsync(@"
            UPDATE product_lots
            SET lot_number = @LotNumber, price = @Price, entry_date = @EntryDate,
                quantity = @Quantity, notes = @Notes
            WHERE id = @Id",
            new { request.LotNumber, request.Price, request.EntryDate, request.Quantity, request.Notes, Id = lotId });

        var actualizado = await conn.QuerySingleAsync<ProductLot>(
            "SELECT * FROM product_lots WHERE id = @Id", new { Id = lotId });

        return MapearLote(actualizado);
    }

    public async Task DeleteLotAsync(Guid productId, Guid lotId)
    {
        using var conn = _db.Create();

        await VerificarProductoExisteAsync(conn, productId);

        var filas = await conn.ExecuteAsync(
            "DELETE FROM product_lots WHERE id = @Id AND product_id = @ProductId",
            new { Id = lotId, ProductId = productId });

        if (filas == 0)
            throw new NotFoundException("Lote", lotId);

        _logger.LogInformation("Lote eliminado: {LotId}", lotId);
    }

    private static async Task VerificarProductoExisteAsync(System.Data.IDbConnection conn, Guid productId)
    {
        var existe = await conn.ExecuteScalarAsync<bool>(
            "SELECT EXISTS(SELECT 1 FROM products WHERE id = @Id AND is_active = TRUE)",
            new { Id = productId });

        if (!existe) throw new NotFoundException("Producto", productId);
    }

    private static ProductResponse MapearProducto(Product p) => new()
    {
        Id          = p.Id,
        Name        = p.Name,
        Description = p.Description,
        Category    = p.Category,
        Sku         = p.Sku,
        Stock       = p.Stock,
        IsActive    = p.IsActive,
        CreatedAt   = p.CreatedAt,
        UpdatedAt   = p.UpdatedAt
    };

    private static LotResponse MapearLote(ProductLot l) => new()
    {
        Id        = l.Id,
        ProductId = l.ProductId,
        LotNumber = l.LotNumber,
        Price     = l.Price,
        EntryDate = l.EntryDate,
        Quantity  = l.Quantity,
        Notes     = l.Notes
    };
}
