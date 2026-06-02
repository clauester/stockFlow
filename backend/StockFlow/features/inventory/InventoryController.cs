using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StockFlow.shared;

namespace StockFlow.features.inventory;

// controlador con todos los endpoints del crud de productos y sus lotes
[ApiController]
[Route("api/products")]
[Authorize]
[Produces("application/json")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _service;

    public InventoryController(IInventoryService service)
    {
        _service = service;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<ProductResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? name = null,
        [FromQuery] string? category = null,
        [FromQuery] string? sku = null)
    {
        var result = await _service.GetAllAsync(page, pageSize, name, category, sku);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ProductResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var product = await _service.GetByIdAsync(id);
        if (product is null) return NotFound(new { message = $"Product '{id}' not found." });
        return Ok(product);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ProductResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create([FromBody] CreateProductRequest request)
    {
        var product = await _service.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ProductResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductRequest request)
    {
        var product = await _service.UpdateAsync(id, request);
        return Ok(product);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("{id:guid}/lots")]
    [ProducesResponseType(typeof(List<LotResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLots(Guid id)
    {
        var lots = await _service.GetLotsAsync(id);
        return Ok(lots);
    }

    [HttpPost("{id:guid}/lots")]
    [ProducesResponseType(typeof(LotResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateLot(Guid id, [FromBody] CreateLotRequest request)
    {
        var lot = await _service.CreateLotAsync(id, request);
        return Created(string.Empty, lot);
    }

    [HttpPut("{id:guid}/lots/{lotId:guid}")]
    [ProducesResponseType(typeof(LotResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLot(Guid id, Guid lotId, [FromBody] UpdateLotRequest request)
    {
        var lot = await _service.UpdateLotAsync(id, lotId, request);
        return Ok(lot);
    }

    [HttpDelete("{id:guid}/lots/{lotId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteLot(Guid id, Guid lotId)
    {
        await _service.DeleteLotAsync(id, lotId);
        return NoContent();
    }
}
