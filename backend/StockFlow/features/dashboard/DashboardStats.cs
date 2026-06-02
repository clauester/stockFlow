namespace StockFlow.features.dashboard;

public class DashboardStats
{
    public int TotalProducts { get; set; }
    public int TotalLots { get; set; }
    public int LowStockProducts { get; set; }
    public int OutOfStockProducts { get; set; }
    public List<CategoryCount> ProductsByCategory { get; set; } = new();
    public List<RecentLot> RecentLots { get; set; } = new();
}

public class CategoryCount
{
    public string Category { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class RecentLot
{
    public string ProductName { get; set; } = string.Empty;
    public string LotNumber { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public DateTime EntryDate { get; set; }
}
