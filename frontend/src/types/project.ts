export interface Project {
  _id: string;
  project_id: string;
  owner_id: string;
  owner_email?: string;
  name: string;
  project_type: string;
  client_organization?: string;
  building_name?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  building_area?: string;
  building_type?: string;
  number_of_floors?: string;
  occupancy_type?: string;
  description?: string;
  tags?: string[];
  logo_url?: string;
  reference_number?: string;
  status: 'Active' | 'In Review' | 'Completed' | string;
  created_at: string;
  updated_at: string;
  last_analyzed_at?: string;
  
  // Hydrated statistics
  documents_count: number;
  completed_documents_count?: number;
  overall_compliance_score: number | null;
  health_score: number | null;
  health_badge: string;
  health_breakdown?: {
    energy_performance: number;
    water_performance: number;
    waste_performance: number;
    compliance_performance: number;
    document_completeness: number;
  };
}

export interface ProjectCreateInput {
  name: string;
  project_type: string;
  client_organization?: string;
  building_name?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  building_area?: string;
  building_type?: string;
  number_of_floors?: string;
  occupancy_type?: string;
  description?: string;
  tags?: string[];
  logo_url?: string;
  reference_number?: string;
}

export interface ProjectUpdateInput {
  name?: string;
  project_type?: string;
  client_organization?: string;
  building_name?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  building_area?: string;
  building_type?: string;
  number_of_floors?: string;
  occupancy_type?: string;
  description?: string;
  tags?: string[];
  status?: string;
}

export interface ProjectKPIs {
  total_documents: number;
  completed_documents: number;
  pending_documents: number;
  overall_compliance_score: number;
  average_compliance_score: number;
  highest_score: number;
  lowest_score: number;
  average_confidence: number;
  total_compliance_rules: number;
  passed_rules: number;
  failed_rules: number;
  partial_rules: number;
}

export interface SustainabilityMetrics {
  energy: {
    filename: string;
    annual_energy_consumption?: string;
    renewable_energy_percentage?: string;
    renewable_energy_generated?: string;
    carbon_emissions?: string;
    electricity_consumption?: string;
    fuel_consumption?: string;
    building_area?: string;
    energy_intensity?: string;
  } | null;
  water: {
    filename: string;
    total_water_consumption?: string;
    fresh_water_usage?: string;
    recycled_water_usage?: string;
    water_recycling_percentage?: string;
    rainwater_harvesting_capacity?: string;
    water_savings?: string;
  } | null;
  waste: {
    filename: string;
    total_waste_generated?: string;
    waste_recycled?: string;
    recycling_percentage?: string;
    hazardous_waste?: string;
    non_hazardous_waste?: string;
    waste_diverted_from_landfill?: string;
  } | null;
  audit?: Record<string, any> | null;
  compliance?: Record<string, any> | null;
}

export interface ProjectAnalytics {
  kpis: ProjectKPIs;
  document_distribution: Record<string, number>;
  compliance_distribution: Record<string, number>;
  health: {
    score: number;
    badge: string;
    overall_compliance: number;
    breakdown: {
      energy_performance: number;
      water_performance: number;
      waste_performance: number;
      compliance_performance: number;
      document_completeness: number;
    };
  };
  sustainability_metrics: SustainabilityMetrics;
}

export interface ProjectTimelineEvent {
  _id: string;
  project_id: string;
  owner_id: string;
  event_type: string;
  title: string;
  detail: string;
  timestamp: string;
}

export interface ProjectInsight {
  id?: string;
  type: 'positive' | 'warning' | 'negative' | 'recommendation' | 'trend';
  category: string;
  title: string;
  description: string;
  impact?: string;
  action?: string;
}
