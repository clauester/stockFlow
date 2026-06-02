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
                "SELECT EXISTS(SELECT 1 FROM users WHERE username = 'superusr')");

            if (!adminExiste)
            {
                var hash = BCrypt.Net.BCrypt.HashPassword("Super1234", workFactor: 12);
                await conn.ExecuteAsync(@"
                    INSERT INTO users (id, username, email, password_hash, role, is_active, created_at)
                    VALUES (gen_random_uuid(), 'superusr', 'superusr@stockflow.com', @Hash, 'Admin', TRUE, NOW())",
                    new { Hash = hash });
                logger.LogInformation("Seed: usuario superusr creado.");
            }

            var consultaExiste = await conn.ExecuteScalarAsync<bool>(
                "SELECT EXISTS(SELECT 1 FROM users WHERE username = 'consulta')");

            if (!consultaExiste)
            {
                var hash = BCrypt.Net.BCrypt.HashPassword("Consul123", workFactor: 12);
                await conn.ExecuteAsync(@"
                    INSERT INTO users (id, username, email, password_hash, role, is_active, created_at)
                    VALUES (gen_random_uuid(), 'consulta', 'consulta@stockflow.com', @Hash, 'Viewer', TRUE, NOW())",
                    new { Hash = hash });
                logger.LogInformation("Seed: usuario consulta creado.");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error en DbSeeder: {Message}", ex.Message);
            throw;
        }
    }
}
