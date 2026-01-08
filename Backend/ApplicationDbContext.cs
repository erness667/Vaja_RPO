using Microsoft.EntityFrameworkCore;
using SuperCarsApi.Models;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Car> Cars { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<BlacklistedToken> BlacklistedTokens { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<CarImage> CarImages { get; set; }
    public DbSet<Favourite> Favourites { get; set; }
    public DbSet<ViewHistory> ViewHistories { get; set; }
    public DbSet<FriendRequest> FriendRequests { get; set; }
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<CarDealership> CarDealerships { get; set; }
    public DbSet<DealershipWorker> DealershipWorkers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.Username).IsUnique();
        });

        modelBuilder.Entity<BlacklistedToken>(entity =>
        {
            entity.HasIndex(b => b.Jti).IsUnique();
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(r => r.Token).IsUnique();
            entity.HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Car>(entity =>
        {
            entity.HasOne(c => c.Seller)
                .WithMany()
                .HasForeignKey(c => c.SellerId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deletion of user if they have cars listed

            entity.HasOne(c => c.Dealership)
                .WithMany()
                .HasForeignKey(c => c.DealershipId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deletion of dealership if they have cars listed

            // Configure Price with proper precision for currency
            entity.Property(c => c.Price)
                .HasPrecision(18, 2); // 18 total digits, 2 decimal places
        });

        modelBuilder.Entity<CarImage>(entity =>
        {
            entity.HasOne(ci => ci.Car)
                .WithMany(c => c.Images)
                .HasForeignKey(ci => ci.CarId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasOne(c => c.Car)
                .WithMany(car => car.Comments)
                .HasForeignKey(c => c.CarId)
                .OnDelete(DeleteBehavior.Cascade); // Delete comments when car is deleted

            entity.HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deletion of user if they have comments
        });

        modelBuilder.Entity<Favourite>(entity =>
        {
            // Unique constraint: a user can only favourite a car once
            entity.HasIndex(f => new { f.UserId, f.CarId }).IsUnique();

            entity.HasOne(f => f.User)
                .WithMany()
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Delete favourites when user is deleted

            entity.HasOne(f => f.Car)
                .WithMany()
                .HasForeignKey(f => f.CarId)
                .OnDelete(DeleteBehavior.Cascade); // Delete favourites when car is deleted
        });

        modelBuilder.Entity<ViewHistory>(entity =>
        {
            // One record per user+car, updated with the latest view time
            entity.HasIndex(vh => new { vh.UserId, vh.CarId }).IsUnique();

            entity.HasOne(vh => vh.User)
                .WithMany()
                .HasForeignKey(vh => vh.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(vh => vh.Car)
                .WithMany()
                .HasForeignKey(vh => vh.CarId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FriendRequest>(entity =>
        {
            // Unique constraint: prevent duplicate friend requests between the same users
            entity.HasIndex(fr => new { fr.RequesterId, fr.AddresseeId }).IsUnique();

            entity.HasOne(fr => fr.Requester)
                .WithMany()
                .HasForeignKey(fr => fr.RequesterId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deletion if user has friend requests

            entity.HasOne(fr => fr.Addressee)
                .WithMany()
                .HasForeignKey(fr => fr.AddresseeId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deletion if user has friend requests
        });

        modelBuilder.Entity<PasswordResetToken>(entity =>
        {
            entity.HasIndex(prt => prt.Token).IsUnique();

            entity.HasOne(prt => prt.User)
                .WithMany()
                .HasForeignKey(prt => prt.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Delete tokens when user is deleted
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deletion if user has sent messages

            entity.HasOne(m => m.Receiver)
                .WithMany()
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deletion if user has received messages

            // Index for faster queries on conversations
            entity.HasIndex(m => new { m.SenderId, m.ReceiverId, m.SentAt });
            entity.HasIndex(m => new { m.ReceiverId, m.IsRead });
        });

        modelBuilder.Entity<CarDealership>(entity =>
        {
            entity.HasOne(d => d.Owner)
                .WithMany()
                .HasForeignKey(d => d.OwnerId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deletion if user owns dealership

            entity.HasOne(d => d.ReviewedByAdmin)
                .WithMany()
                .HasForeignKey(d => d.ReviewedByAdminId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deletion if admin reviewed

            // Index for faster queries
            entity.HasIndex(d => d.OwnerId);
            entity.HasIndex(d => d.Status);
        });

        modelBuilder.Entity<DealershipWorker>(entity =>
        {
            // Unique constraint: a user can only be a worker in a dealership once
            entity.HasIndex(dw => new { dw.DealershipId, dw.UserId }).IsUnique();

            entity.HasOne(dw => dw.Dealership)
                .WithMany(d => d.Workers)
                .HasForeignKey(dw => dw.DealershipId)
                .OnDelete(DeleteBehavior.Cascade); // Delete workers when dealership is deleted

            entity.HasOne(dw => dw.User)
                .WithMany()
                .HasForeignKey(dw => dw.UserId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deletion if user is a worker

            entity.HasOne(dw => dw.InvitedByUser)
                .WithMany()
                .HasForeignKey(dw => dw.InvitedByUserId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deletion if user invited workers

            // Index for faster queries
            entity.HasIndex(dw => dw.UserId);
            entity.HasIndex(dw => dw.DealershipId);
            entity.HasIndex(dw => dw.Status);
        });
    }
}