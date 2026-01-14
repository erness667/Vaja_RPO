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

        /// <summary>
        /// Average rating of the comment (1-5 stars).
        /// </summary>
        public double? AverageRating { get; set; }

        /// <summary>
        /// Total number of ratings.
        /// </summary>
        public int RatingCount { get; set; }

        /// <summary>
        /// Current user's rating for this comment (1-5 stars), null if not rated.
        /// </summary>
        public int? UserRating { get; set; }
    }

    public class CommentAuthor
    {
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string? AvatarImageUrl { get; set; }
    }
}

