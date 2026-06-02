using Npgsql;
using System.Data;
using Dapper;

namespace StockFlow.infrastructure.database;

// clase para crear la conexión a la base de datos postgres usando dapper
public class DbConnectionFactory
{
    private readonly string _connectionString;

    public DbConnectionFactory(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

        // mapea snake_case de postgres a PascalCase de C# automáticamente
        DefaultTypeMap.MatchNamesWithUnderscores = true;
    }

    public IDbConnection Create()
    {
        var connection = new NpgsqlConnection(_connectionString);
        connection.Open();
        return connection;
    }
}
