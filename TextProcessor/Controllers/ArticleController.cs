using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TextProcessor.Data;
using TextProcessor.Models;
using Microsoft.EntityFrameworkCore;
using TextProcessor.Entities;


namespace TextProcessor.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArticleController : ControllerBase
    {
        private readonly ILogger<ArticleController> _logger;
        private readonly AppDbContext _dbContext;

        public ArticleController(ILogger<ArticleController> logger, AppDbContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext;
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] ArticleModel articleModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var article = new TextProcessor.Entities.Article
                {
                    Title = articleModel.Title,
                    Content = articleModel.Content,
                    CreatedDate = DateTime.UtcNow
                };

                // Process the image if provided
                if (articleModel.Image != null && articleModel.Image.Length > 0)
                {
                    using var memoryStream = new MemoryStream();
                    await articleModel.Image.CopyToAsync(memoryStream);

                    // Set image data and metadata
                    article.ImageData = memoryStream.ToArray();
                    article.ImageMimeType = articleModel.Image.ContentType;
                    article.ImageFileName = articleModel.Image.FileName;

                    _logger.LogInformation("Image '{FileName}' ({ContentType}, {Size} bytes) uploaded successfully",
                        articleModel.Image.FileName,
                        articleModel.Image.ContentType,
                        articleModel.Image.Length);
                }

                await _dbContext.Articles.AddAsync(article);
                await _dbContext.SaveChangesAsync();

                _logger.LogInformation("Article created successfully: {ArticleId}", article.Id);

                articleModel.Id = article.Id; // Get the generated ID
                return StatusCode(201, new { id = article.Id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating article with image");
                return StatusCode(500, "An error occurred while saving the article");
            }
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ArticleModel>>> Get()
        {
            try
            {
                var articles = await _dbContext.Articles.ToListAsync();

                var articleModels = articles.Select(article => new ArticleModel
                {
                    Id = article.Id,
                    Title = article.Title,
                    Content = article.Content,
                    CreatedDate = article.CreatedDate,
                    ImageMimeType = article.ImageMimeType,
                    ImageBase64 = article.ImageData != null
        ? $"data:{article.ImageMimeType};base64,{Convert.ToBase64String(article.ImageData)}"
        : null
                }).ToList();


                _logger.LogInformation("Retrieved {Count} articles successfully", articleModels.Count);
                return Ok(articleModels);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving articles");
                return StatusCode(500, "An error occurred while retrieving articles");
            }
        }



    }
}
