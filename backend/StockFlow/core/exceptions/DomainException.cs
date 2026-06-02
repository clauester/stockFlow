namespace StockFlow.core.exceptions;

public class DomainException : Exception
{
    public DomainException(string message) : base(message) { }
}
