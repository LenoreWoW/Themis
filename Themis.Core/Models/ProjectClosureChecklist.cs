using System;

namespace Themis.Core.Models
{
    public class ProjectClosureChecklist
    {
        public bool TasksCompleted { get; set; }
        public string TasksCompletedNotes { get; set; }
        
        public bool DeliverableAccepted { get; set; }
        public string DeliverableAcceptedNotes { get; set; }
        
        public bool ResourcesReleased { get; set; }
        public string ResourcesReleasedNotes { get; set; }
        
        public bool DocumentationComplete { get; set; }
        public string DocumentationCompleteNotes { get; set; }
        
        public bool FinancialsClosed { get; set; }
        public string FinancialsClosedNotes { get; set; }
        
        public bool LessonsLearned { get; set; }
        public string LessonsLearnedNotes { get; set; }
        
        public bool ClientFeedbackCollected { get; set; }
        public string ClientFeedbackNotes { get; set; }
        
        public bool TeamPerformanceReviewed { get; set; }
        public string TeamPerformanceNotes { get; set; }
    }
} 