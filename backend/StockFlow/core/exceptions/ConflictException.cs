namespace StockFlow.core.exceptions;

public class ConflictException : DomainException
{
    public ConflictException(string message) : base(message) { }
}
