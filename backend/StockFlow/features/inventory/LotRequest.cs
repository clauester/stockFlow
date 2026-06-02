using System.ComponentModel.DataAnnotations;

namespace StockFlow.features.inventory;

public class CreateLotRequest
{
    [Required, MaxLength(50)]
    public string LotNumber { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0.")]
    public decimal Price { get; set; }

    public DateTime EntryDate { get; set; } = DateTime.UtcNow;

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }

    [MaxLength(300)]
    public string? Notes { get; set; }
}

public class UpdateLotRequest
{
    [Required, MaxLength(50)]
    public string LotNumber { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0.")]
    public decimal Price { get; set; }

    public DateTime EntryDate { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1.")]
    public int Quantity { get; set; }

    [MaxLength(300)]
    public string? Notes { get; set; }
}
