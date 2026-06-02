namespace StockFlow.features.inventory;

public class LotResponse
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string LotNumber { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public DateTime EntryDate { get; set; }
    public int Quantity { get; set; }
    public string? Notes { get; set; }
}
