using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Themis.Core.Common;
using Themis.Core.Entities;

namespace Themis.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectTask> Tasks { get; set; }
        public DbSet<Approval> Approvals { get; set; }
        public DbSet<RiskIssue> RisksIssues { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<Financial> Financials { get; set; }
        public DbSet<ProjectAttachment> ProjectAttachments { get; set; }
        public DbSet<ProjectTeamMember> ProjectTeamMembers { get; set; }
        public DbSet<ProjectClosure> ProjectClosures { get; set; }
        public DbSet<ProjectClosureSignOff> ProjectClosureSignOffs { get; set; }
        public DbSet<ProjectClosureAttachment> ProjectClosureAttachments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User
            modelBuilder.Entity<User>()
                .HasOne(u => u.Department)
                .WithMany(d => d.Users)
                .HasForeignKey(u => u.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull);

            // Project
            modelBuilder.Entity<Project>()
                .HasOne(p => p.Department)
                .WithMany(d => d.Projects)
                .HasForeignKey(p => p.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Project>()
                .HasOne(p => p.ProjectManager)
                .WithMany(u => u.ManagedProjects)
                .HasForeignKey(p => p.PMUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Project>()
                .HasOne(p => p.Financial)
                .WithOne(f => f.Project)
                .HasForeignKey<Financial>(f => f.ProjectId);

            // Project dependencies (self-referencing many-to-many)
            modelBuilder.Entity<Project>()
                .HasMany(p => p.DependentProjects)
                .WithMany(p => p.DependsOnProjects)
                .UsingEntity<Dictionary<string, object>>(
                    "ProjectDependencies",
                    j => j.HasOne<Project>().WithMany().HasForeignKey("DependentProjectId").OnDelete(DeleteBehavior.Cascade),
                    j => j.HasOne<Project>().WithMany().HasForeignKey("DependsOnProjectId").OnDelete(DeleteBehavior.ClientCascade)
                );

            // ProjectTask
            modelBuilder.Entity<ProjectTask>()
                .HasOne(t => t.Project)
                .WithMany(p => p.Tasks)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectTask>()
                .HasOne(t => t.AssignedUser)
                .WithMany(u => u.AssignedTasks)
                .HasForeignKey(t => t.AssignedUserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<ProjectTask>()
                .HasOne(t => t.ParentTask)
                .WithMany()
                .HasForeignKey(t => t.ParentTaskId)
                .OnDelete(DeleteBehavior.Restrict);

            // Approval
            modelBuilder.Entity<Approval>()
                .HasOne(a => a.Project)
                .WithMany(p => p.Approvals)
                .HasForeignKey(a => a.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Approval>()
                .HasOne(a => a.RequestedByUser)
                .WithMany(u => u.RequestedApprovals)
                .HasForeignKey(a => a.RequestedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Approval>()
                .HasOne(a => a.ApprovedByUser)
                .WithMany(u => u.GivenApprovals)
                .HasForeignKey(a => a.ApprovedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // RiskIssue
            modelBuilder.Entity<RiskIssue>()
                .HasOne(r => r.Project)
                .WithMany(p => p.RisksIssues)
                .HasForeignKey(r => r.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // ProjectAttachment
            modelBuilder.Entity<ProjectAttachment>()
                .HasOne(a => a.Project)
                .WithMany(p => p.Attachments)
                .HasForeignKey(a => a.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectAttachment>()
                .HasOne(a => a.UploadedByUser)
                .WithMany()
                .HasForeignKey(a => a.UploadedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ProjectTeamMember
            modelBuilder.Entity<ProjectTeamMember>()
                .HasOne(tm => tm.Project)
                .WithMany(p => p.TeamMembers)
                .HasForeignKey(tm => tm.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectTeamMember>()
                .HasOne(tm => tm.User)
                .WithMany()
                .HasForeignKey(tm => tm.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // AuditLog
            modelBuilder.Entity<AuditLog>()
                .HasOne(al => al.User)
                .WithMany()
                .HasForeignKey(al => al.UserId)
                .OnDelete(DeleteBehavior.Restrict);
                
            // ProjectClosure
            modelBuilder.Entity<ProjectClosure>()
                .HasOne(pc => pc.Project)
                .WithOne()
                .HasForeignKey<ProjectClosure>(pc => pc.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectClosureSignOff>()
                .HasOne(pcs => pcs.ProjectClosure)
                .WithMany(pc => pc.StakeholderSignOffs)
                .HasForeignKey(pcs => pcs.ProjectClosureId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectClosureSignOff>()
                .HasOne(pcs => pcs.Stakeholder)
                .WithMany()
                .HasForeignKey(pcs => pcs.StakeholderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProjectClosureAttachment>()
                .HasOne(pca => pca.ProjectClosure)
                .WithMany(pc => pc.Attachments)
                .HasForeignKey(pca => pca.ProjectClosureId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectClosureAttachment>()
                .HasOne(pca => pca.UploadedBy)
                .WithMany()
                .HasForeignKey(pca => pca.UploadedById)
                .OnDelete(DeleteBehavior.Restrict);
        }

        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateTimestamps()
        {
            var entities = ChangeTracker.Entries()
                .Where(x => x.Entity is BaseEntity && (x.State == EntityState.Added || x.State == EntityState.Modified));

            foreach (var entity in entities)
            {
                if (entity.State == EntityState.Added)
                {
                    ((BaseEntity)entity.Entity).CreatedAt = DateTime.UtcNow;
                }

                if (entity.State == EntityState.Modified)
                {
                    ((BaseEntity)entity.Entity).UpdatedAt = DateTime.UtcNow;
                }
            }
        }
    }
} 