using StockFlow.shared;

namespace StockFlow.features.inventory;

public interface IInventoryService
{
    Task<PaginatedResult<ProductResponse>> GetAllAsync(int page, int pageSize, string? name, string? code);
    Task<ProductResponse?> GetByIdAsync(Guid id);
    Task<ProductResponse> CreateAsync(CreateProductRequest request);
    Task<ProductResponse> UpdateAsync(Guid id, UpdateProductRequest request);
    Task DeleteAsync(Guid id);

    Task<List<LotResponse>> GetLotsAsync(Guid productId);
    Task<LotResponse> CreateLotAsync(Guid productId, CreateLotRequest request);
    Task<LotResponse> UpdateLotAsync(Guid productId, Guid lotId, UpdateLotRequest request);
    Task DeleteLotAsync(Guid productId, Guid lotId);
}
