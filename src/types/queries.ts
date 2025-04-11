// Tipos para las tablas principales
export interface Channel {
  id: number;
  name: string;
  owners: Owner[];
  msignals: Msignal[];
  copy_trades: CopyTrade[];
  users: User[];
}

export interface Owner {
  id: number;
  user_id: number;
  channel_id: number;
  user: User;
  channel: Channel;
  msignals: Msignal[];
}

export interface Msignal {
  id: number;
  owner_id: number;
  owner: Owner;
  copy_trades: CopyTrade[];
  active_copy_trades: CopyTrade[];
  copiers: User[];
}

export interface CopyTrade {
  id: number;
  msignal_id: number;
  user_id: number;
  msignal: Msignal;
  user: User;
  orders: Order[];
  flags: Flag[];
  balances: Balance[];
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Order {
  id: number;
  copy_trade_id: number;
}

export interface Flag {
  id: number;
  flagable_type: string;
  flagable_id: number;
}

export interface Balance {
  id: number;
  balanceable_type: string;
  balanceable_id: number;
}

// Tipos para los queries
export interface QueryFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  value: any;
}

export interface QueryOptions {
  include?: string[];
  filters?: QueryFilter[];
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;
  offset?: number;
}

// User Story:
// Como usuario del dashboard, quiero poder filtrar y visualizar datos de trades copiados
// junto con sus señales relacionadas, canales y propietarios, para poder analizar
// el rendimiento y la actividad de trading de manera efectiva. 