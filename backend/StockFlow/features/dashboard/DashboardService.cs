using Dapper;
using StockFlow.infrastructure.database;

namespace StockFlow.features.dashboard;

// servicio que consulta las métricas del inventario para el dashboard
public class DashboardService : IDashboardService
{
    private readonly DbConnectionFactory _db;

    public DashboardService(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<DashboardStats> GetStatsAsync()
    {
        using var conn = _db.Create();

        var totalProducts = await conn.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM products WHERE is_active = TRUE");

        var totalLots = await conn.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM product_lots");

        var lowStock = await conn.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM products WHERE is_active = TRUE AND stock > 0 AND stock <= 5");

        var outOfStock = await conn.ExecuteScalarAsync<int>(
            "SELECT COUNT(*) FROM products WHERE is_active = TRUE AND stock = 0");

        var byCategory = (await conn.QueryAsync<CategoryCount>(@"
            SELECT category, COUNT(*) AS count
            FROM products
            WHERE is_active = TRUE
            GROUP BY category
            ORDER BY count DESC")).ToList();

        var recentLots = (await conn.QueryAsync<RecentLot>(@"
            SELECT p.name AS product_name, l.lot_number, l.quantity, l.price, l.entry_date
            FROM product_lots l
            INNER JOIN products p ON p.id = l.product_id
            WHERE p.is_active = TRUE
            ORDER BY l.entry_date DESC
            LIMIT 5")).ToList();

        return new DashboardStats
        {
            TotalProducts      = totalProducts,
            TotalLots          = totalLots,
            LowStockProducts   = lowStock,
            OutOfStockProducts = outOfStock,
            ProductsByCategory = byCategory,
            RecentLots         = recentLots
        };
    }
}
