namespace StockFlow.features.auth;

public interface IAuthService
{
    Task<LoginResponse?> LoginAsync(LoginRequest request);
    Task<CurrentUserResponse?> GetCurrentUserAsync(Guid userId);
}
