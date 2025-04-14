using System.ComponentModel.DataAnnotations;
using Themis.Core.Enums;

namespace Themis.API.Models
{
    public class UpdateRiskIssueRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string Name { get; set; }

        public string Description { get; set; }

        [Required]
        public RiskSeverity Severity { get; set; }

        [Required]
        public RiskProbability Probability { get; set; }

        [Required]
        public bool IsIssue { get; set; }

        [Required]
        public string Status { get; set; }

        public string MitigationPlan { get; set; }
    }
} 