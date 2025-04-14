using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using Themis.Core.Entities;
using Themis.Core.Enums;

namespace Themis.Infrastructure.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // Create database if it doesn't exist
            context.Database.EnsureCreated();

            // Check if there's already data
            if (context.Users.Any())
            {
                return; // Database has been seeded
            }

            // Seed departments
            var departments = new Department[]
            {
                new Department { Name = "Information Technology" },
                new Department { Name = "Operations" },
                new Department { Name = "Finance" },
                new Department { Name = "Marketing" },
                new Department { Name = "Human Resources" }
            };

            foreach (var department in departments)
            {
                context.Departments.Add(department);
            }
            context.SaveChanges();

            // Seed users
            var itDepartment = departments[0];
            var opsDepartment = departments[1];
            var financeDepartment = departments[2];

            var users = new User[]
            {
                new User 
                { 
                    Username = "admin",
                    Role = UserRole.Admin,
                    ADIdentifier = "admin@themis.local",
                    DepartmentId = itDepartment.Id
                },
                new User 
                { 
                    Username = "executive",
                    Role = UserRole.Executive,
                    ADIdentifier = "exec@themis.local",
                    DepartmentId = itDepartment.Id
                },
                new User 
                { 
                    Username = "mainpmo",
                    Role = UserRole.MainPMO,
                    ADIdentifier = "mainpmo@themis.local",
                    DepartmentId = itDepartment.Id
                },
                new User 
                { 
                    Username = "itdirector", 
                    Role = UserRole.DepartmentDirector,
                    ADIdentifier = "itdirector@themis.local",
                    DepartmentId = itDepartment.Id
                },
                new User 
                { 
                    Username = "opsdirector", 
                    Role = UserRole.DepartmentDirector,
                    ADIdentifier = "opsdirector@themis.local",
                    DepartmentId = opsDepartment.Id
                },
                new User 
                { 
                    Username = "itpmo", 
                    Role = UserRole.SubPMO,
                    ADIdentifier = "itpmo@themis.local",
                    DepartmentId = itDepartment.Id
                },
                new User 
                { 
                    Username = "opspmo", 
                    Role = UserRole.SubPMO,
                    ADIdentifier = "opspmo@themis.local",
                    DepartmentId = opsDepartment.Id
                },
                new User 
                { 
                    Username = "itpm1", 
                    Role = UserRole.ProjectManager,
                    ADIdentifier = "itpm1@themis.local",
                    DepartmentId = itDepartment.Id
                },
                new User 
                { 
                    Username = "itpm2", 
                    Role = UserRole.ProjectManager,
                    ADIdentifier = "itpm2@themis.local",
                    DepartmentId = itDepartment.Id
                },
                new User 
                { 
                    Username = "opspm", 
                    Role = UserRole.ProjectManager,
                    ADIdentifier = "opspm@themis.local",
                    DepartmentId = opsDepartment.Id
                }
            };

            foreach (var user in users)
            {
                context.Users.Add(user);
            }
            context.SaveChanges();

            // Seed projects
            var itPM1 = users.Single(u => u.Username == "itpm1");
            var itPM2 = users.Single(u => u.Username == "itpm2");
            var opsPM = users.Single(u => u.Username == "opspm");

            var projects = new Project[]
            {
                new Project 
                { 
                    Title = "ERP System Implementation",
                    Description = "Implement a new Enterprise Resource Planning system for the organization.",
                    DepartmentId = itDepartment.Id,
                    PMUserId = itPM1.Id,
                    Status = ProjectStatus.InProgress,
                    Budget = 500000,
                    GoalsLink = "https://confluence.themis.local/goals/erp",
                    Financial = new Financial 
                    { 
                        PlannedCost = 500000,
                        ActualCost = 250000
                    }
                },
                new Project 
                { 
                    Title = "Cloud Migration",
                    Description = "Migrate on-premises infrastructure to the cloud.",
                    DepartmentId = itDepartment.Id,
                    PMUserId = itPM2.Id,
                    Status = ProjectStatus.Draft,
                    Budget = 300000,
                    GoalsLink = "https://confluence.themis.local/goals/cloud",
                    Financial = new Financial 
                    { 
                        PlannedCost = 300000,
                        ActualCost = 0
                    }
                },
                new Project 
                { 
                    Title = "Warehouse Optimization",
                    Description = "Optimize warehouse operations and logistics.",
                    DepartmentId = opsDepartment.Id,
                    PMUserId = opsPM.Id,
                    Status = ProjectStatus.SubPMOReview,
                    Budget = 250000,
                    GoalsLink = "https://confluence.themis.local/goals/warehouse",
                    Financial = new Financial 
                    { 
                        PlannedCost = 250000,
                        ActualCost = 0
                    }
                }
            };

            foreach (var project in projects)
            {
                context.Projects.Add(project);
            }
            context.SaveChanges();

            // Seed tasks
            var erpProject = projects[0];
            var cloudProject = projects[1];

            var tasks = new ProjectTask[]
            {
                new ProjectTask 
                { 
                    ProjectId = erpProject.Id,
                    AssignedUserId = itPM1.Id,
                    Title = "Requirements Gathering",
                    Description = "Gather and document system requirements from stakeholders.",
                    StartDate = DateTime.Now.AddDays(-30),
                    DueDate = DateTime.Now.AddDays(-15),
                    Status = Themis.Core.Enums.TaskStatus.Completed,
                    IsMilestone = false
                },
                new ProjectTask 
                { 
                    ProjectId = erpProject.Id,
                    AssignedUserId = itPM1.Id,
                    Title = "Vendor Selection",
                    Description = "Evaluate and select ERP vendors.",
                    StartDate = DateTime.Now.AddDays(-14),
                    DueDate = DateTime.Now.AddDays(-1),
                    Status = Themis.Core.Enums.TaskStatus.Completed,
                    IsMilestone = true
                },
                new ProjectTask 
                { 
                    ProjectId = erpProject.Id,
                    AssignedUserId = itPM1.Id,
                    Title = "System Implementation",
                    Description = "Implement the selected ERP system.",
                    StartDate = DateTime.Now,
                    DueDate = DateTime.Now.AddDays(60),
                    Status = Themis.Core.Enums.TaskStatus.InProgress,
                    IsMilestone = false
                },
                new ProjectTask 
                { 
                    ProjectId = cloudProject.Id,
                    AssignedUserId = itPM2.Id,
                    Title = "Cloud Assessment",
                    Description = "Assess current infrastructure and plan migration strategy.",
                    StartDate = DateTime.Now.AddDays(-10),
                    DueDate = DateTime.Now.AddDays(10),
                    Status = Themis.Core.Enums.TaskStatus.InProgress,
                    IsMilestone = false
                }
            };

            foreach (var task in tasks)
            {
                context.Tasks.Add(task);
            }
            context.SaveChanges();

            // Seed risks/issues
            var risksIssues = new RiskIssue[]
            {
                new RiskIssue 
                { 
                    ProjectId = erpProject.Id,
                    Name = "Data Migration Risk",
                    Description = "Risk of data loss or corruption during migration.",
                    Severity = RiskSeverity.High,
                    Probability = RiskProbability.Medium,
                    IsIssue = false,
                    Status = "Open",
                    MitigationPlan = "Create comprehensive backup strategy and test migration process thoroughly."
                },
                new RiskIssue 
                { 
                    ProjectId = erpProject.Id,
                    Name = "Vendor Contract Delay",
                    Description = "Contract negotiations with the vendor are taking longer than expected.",
                    Severity = RiskSeverity.Medium,
                    Probability = RiskProbability.High,
                    IsIssue = true,
                    Status = "Open",
                    MitigationPlan = "Escalate to legal team and request priority handling."
                }
            };

            foreach (var riskIssue in risksIssues)
            {
                context.RisksIssues.Add(riskIssue);
            }
            context.SaveChanges();

            // Seed approvals
            var warehouseProject = projects[2];
            var subPMO = users.Single(u => u.Username == "opspmo");

            var approvals = new Approval[]
            {
                new Approval 
                { 
                    ProjectId = warehouseProject.Id,
                    RequestType = RequestType.NewProject,
                    RequestedByUserId = opsPM.Id,
                    ApprovalStatus = ApprovalStatus.ApprovedBySubPMO,
                    ApprovalDate = DateTime.Now.AddDays(-1),
                    Comments = "Project plan looks good.",
                    PreviousStatus = ProjectStatus.Draft.ToString(),
                    NewStatus = ProjectStatus.SubPMOReview.ToString(),
                    ApprovedByUserId = subPMO.Id
                }
            };

            foreach (var approval in approvals)
            {
                context.Approvals.Add(approval);
            }
            context.SaveChanges();

            // Seed audit logs
            var auditLogs = new AuditLog[]
            {
                new AuditLog 
                { 
                    EntityType = "Project",
                    EntityId = erpProject.Id,
                    UserId = itPM1.Id,
                    Action = "Create",
                    Details = "Created project: ERP System Implementation",
                    Timestamp = DateTime.Now.AddDays(-45)
                },
                new AuditLog 
                { 
                    EntityType = "Project",
                    EntityId = cloudProject.Id,
                    UserId = itPM2.Id,
                    Action = "Create",
                    Details = "Created project: Cloud Migration",
                    Timestamp = DateTime.Now.AddDays(-15)
                },
                new AuditLog 
                { 
                    EntityType = "Project",
                    EntityId = warehouseProject.Id,
                    UserId = opsPM.Id,
                    Action = "Create",
                    Details = "Created project: Warehouse Optimization",
                    Timestamp = DateTime.Now.AddDays(-5)
                },
                new AuditLog 
                { 
                    EntityType = "Project",
                    EntityId = warehouseProject.Id,
                    UserId = opsPM.Id,
                    Action = "SubmitForApproval",
                    Details = "Project submitted for NewProject approval.",
                    Timestamp = DateTime.Now.AddDays(-2)
                },
                new AuditLog 
                { 
                    EntityType = "Project",
                    EntityId = warehouseProject.Id,
                    UserId = subPMO.Id,
                    Action = "ApproveRequest",
                    Details = "Project NewProject request approved by Sub PMO.",
                    Timestamp = DateTime.Now.AddDays(-1)
                }
            };

            foreach (var auditLog in auditLogs)
            {
                context.AuditLogs.Add(auditLog);
            }
            context.SaveChanges();
        }
    }
} 