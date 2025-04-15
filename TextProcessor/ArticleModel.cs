using System;
using System.ComponentModel.DataAnnotations;

namespace TextProcessor.Models
{
    public class ArticleModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public required string Title { get; set; }

        [Required(ErrorMessage = "Content is required")]
        public required string Content { get; set; }

        // Image file from form
        public IFormFile? Image { get; set; }

        public string? ImageMimeType { get; set; }

        // Base64 representation of the image
        public string? ImageBase64 { get; set; }

        // Date when the article was created
        public DateTime CreatedDate { get; set; }
    }
}
