export interface Make {
  id?: string;
  name?: string;
  slug?: string;
}

export interface Model {
  id?: string;
  name?: string;
  slug?: string;
  makeId?: string;
  makeName?: string;
}

