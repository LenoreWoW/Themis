using System;

namespace Themis.API.Models
{
    public class RiskIssueSummary
    {
        public Guid ProjectId { get; set; }
        public int TotalRisks { get; set; }
        public int TotalIssues { get; set; }
        public int HighSeverityCount { get; set; }
        public int MediumSeverityCount { get; set; }
        public int LowSeverityCount { get; set; }
        public int OpenItemsCount { get; set; }
    }
} 