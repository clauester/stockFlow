using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Dapper;
using Microsoft.IdentityModel.Tokens;
using StockFlow.core.entities;
using StockFlow.infrastructure.database;

namespace StockFlow.features.auth;

// servicio que maneja el login y la generación del token jwt
public class AuthService : IAuthService
{
    private readonly DbConnectionFactory _db;
    private readonly IConfiguration _config;
    private readonly ILogger<AuthService> _logger;

    public AuthService(DbConnectionFactory db, IConfiguration config, ILogger<AuthService> logger)
    {
        _db     = db;
        _config = config;
        _logger = logger;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        using var conn = _db.Create();

        var user = await conn.QuerySingleOrDefaultAsync<User>(
            "SELECT * FROM users WHERE username = @Username AND is_active = TRUE",
            new { request.Username });

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Intento de login fallido para el usuario: {Username}", request.Username);
            return null;
        }

        var token     = GenerateToken(user);
        var expiresAt = DateTime.UtcNow.AddHours(8);

        _logger.LogInformation("Usuario {Username} autenticado correctamente.", user.Username);

        return new LoginResponse
        {
            Token     = token,
            Username  = user.Username,
            Email     = user.Email,
            Role      = user.Role,
            ExpiresAt = expiresAt
        };
    }

    public async Task<CurrentUserResponse?> GetCurrentUserAsync(Guid userId)
    {
        using var conn = _db.Create();

        var user = await conn.QuerySingleOrDefaultAsync<User>(
            "SELECT * FROM users WHERE id = @Id AND is_active = TRUE",
            new { Id = userId });

        if (user is null) return null;

        return new CurrentUserResponse
        {
            Id       = user.Id,
            Username = user.Username,
            Email    = user.Email,
            Role     = user.Role
        };
    }

    private string GenerateToken(User user)
    {
        var secret  = _config["Jwt:Secret"] ?? throw new InvalidOperationException("Jwt:Secret no está configurado.");
        var key     = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds   = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddHours(8);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,  user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Name, user.Username),
            new Claim(ClaimTypes.Role,              user.Role),
            new Claim(JwtRegisteredClaimNames.Jti,  Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer:             _config["Jwt:Issuer"],
            audience:           _config["Jwt:Audience"],
            claims:             claims,
            expires:            expires,
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
