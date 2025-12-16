namespace Backend.DTOs.Comment
{
    public class CommentDto
    {
        public int Id { get; set; }
        public int CarId { get; set; }
        public Guid UserId { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        /// <summary>
        /// Author information for the comment.
        /// </summary>
        public CommentAuthor? Author { get; set; }
    }

    public class CommentAuthor
    {
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string? AvatarImageUrl { get; set; }
    }
}

