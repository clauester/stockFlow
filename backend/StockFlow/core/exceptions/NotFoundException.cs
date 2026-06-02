namespace StockFlow.core.exceptions;

public class NotFoundException : DomainException
{
    public NotFoundException(string message) : base(message) { }

    public NotFoundException(string entity, Guid id)
        : base($"{entity} with id '{id}' was not found.") { }
}
