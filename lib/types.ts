export interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  has_voted: boolean;
  voted_at: string | null;
}

export interface Finalist {
  id: number;
  first_name: string;
  last_name: string;
  project_name: string;
  description: string;
  photo_url: string;
  display_order: number;
}
