namespace StockFlow.features.dashboard;

public interface IDashboardService
{
    Task<DashboardStats> GetStatsAsync();
}
