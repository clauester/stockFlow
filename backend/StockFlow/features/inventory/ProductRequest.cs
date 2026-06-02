using System.ComponentModel.DataAnnotations;

namespace StockFlow.features.inventory;

public class CreateProductRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Sku { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int Stock { get; set; }
}

public class UpdateProductRequest
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Sku { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int Stock { get; set; }
}
