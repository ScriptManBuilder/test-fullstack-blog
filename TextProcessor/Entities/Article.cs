using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TextProcessor.Entities
{
    [Table("Articles")]
    public class Article
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public required string Title { get; set; }

        [Required]
        public required string Content { get; set; }

        // Image as BLOB
        public byte[]? ImageData { get; set; }

        // Image metadata
        [MaxLength(100)]
        public string? ImageMimeType { get; set; }

        [MaxLength(255)]
        public string? ImageFileName { get; set; }
        
        // Date when the article was created
        public DateTime CreatedDate { get; set; }
    }
}
