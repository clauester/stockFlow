using Dapper;

namespace StockFlow.infrastructure.database;

// clase para insertar los datos iniciales en la base de datos al arrancar la aplicación
public static class DbSeeder
{
    public static async Task SeedAsync(DbConnectionFactory factory, ILogger logger)
    {
        try
        {
            using var conn = factory.Create();

            var adminExiste = await conn.ExecuteScalarAsync<bool>(
                "SELECT EXISTS(SELECT 1 FROM users WHERE username = 'admin')");

            if (!adminExiste)
            {
                var hash = BCrypt.Net.BCrypt.HashPassword("admin123", workFactor: 12);
                await conn.ExecuteAsync(@"
                    INSERT INTO users (id, username, email, password_hash, role, is_active, created_at)
                    VALUES (gen_random_uuid(), 'admin', 'admin@stockflow.com', @Hash, 'Admin', TRUE, NOW())",
                    new { Hash = hash });
                logger.LogInformation("Seed: usuario admin creado.");
            }

            var viewerExiste = await conn.ExecuteScalarAsync<bool>(
                "SELECT EXISTS(SELECT 1 FROM users WHERE username = 'viewer')");

            if (!viewerExiste)
            {
                var hash = BCrypt.Net.BCrypt.HashPassword("viewer123", workFactor: 12);
                await conn.ExecuteAsync(@"
                    INSERT INTO users (id, username, email, password_hash, role, is_active, created_at)
                    VALUES (gen_random_uuid(), 'viewer', 'viewer@stockflow.com', @Hash, 'Viewer', TRUE, NOW())",
                    new { Hash = hash });
                logger.LogInformation("Seed: usuario viewer creado.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error en DbSeeder: {Message}", ex.Message);
            throw;
        }
    }
}
