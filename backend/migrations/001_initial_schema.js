/* eslint-disable camelcase */

exports.shorthands = {
  uuid: { type: 'uuid' },
  timestamptz: { type: 'timestamptz', notNull: true, default: 'now()' },
  text: { type: 'text' },
  jsonb: { type: 'jsonb' },
};

exports.up = (pgm) => {
  // Enable UUID extension
  pgm.createExtension('uuid-ossp', { ifNotExists: true });

  // Create analytics_configs table
  pgm.createTable('analytics_configs', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    role: { type: 'text', notNull: true },
    chart_settings: { type: 'jsonb', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Create analytics_forecasts table
  pgm.createTable('analytics_forecasts', {
    project_id: { type: 'uuid', primaryKey: true },
    predicted_end: { type: 'timestamptz', notNull: true },
    prediction_data: { type: 'jsonb' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Create chat_messages table
  pgm.createTable('chat_messages', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    room_id: { type: 'uuid', notNull: true },
    user_id: { type: 'uuid', notNull: true },
    content: { type: 'text', notNull: true },
    metadata: { type: 'jsonb' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Create indexes for chat_messages
  pgm.createIndex('chat_messages', 'room_id');
  pgm.createIndex('chat_messages', 'user_id');
  pgm.createIndex('chat_messages', 'created_at');

  // Create documents table
  pgm.createTable('documents', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    title: { type: 'text', notNull: true },
    content: { type: 'text' },
    project_id: { type: 'uuid' },
    owner_id: { type: 'uuid', notNull: true },
    metadata: { type: 'jsonb' },
    version: { type: 'integer', notNull: true, default: 1 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Create indexes for documents
  pgm.createIndex('documents', 'project_id');
  pgm.createIndex('documents', 'owner_id');
  pgm.createIndex('documents', 'title', { method: 'gin', options: { default_opclass: 'gin_trgm_ops' } });
  pgm.createIndex('documents', ['content'], {
    method: 'gin',
    name: 'idx_documents_content_search',
    expression: 'to_tsvector(\'english\', content)'
  });

  // Create user_availability table
  pgm.createTable('user_availability', {
    user_id: { type: 'uuid', notNull: true },
    start_time: { type: 'timestamptz', notNull: true },
    end_time: { type: 'timestamptz', notNull: true },
    notes: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Add primary key to user_availability
  pgm.addConstraint('user_availability', 'pk_user_availability', {
    primaryKey: ['user_id', 'start_time']
  });

  // Create reports table
  pgm.createTable('reports', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    name: { type: 'text', notNull: true },
    description: { type: 'text' },
    owner_id: { type: 'uuid', notNull: true },
    schema: { type: 'jsonb', notNull: true },
    is_template: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Create report_templates table
  pgm.createTable('report_templates', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    name: { type: 'text', notNull: true },
    description: { type: 'text' },
    schema: { type: 'jsonb', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Create report_schedules table
  pgm.createTable('report_schedules', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    report_id: { type: 'uuid', notNull: true, references: 'reports' },
    rrule: { type: 'text', notNull: true }, // Recurrence rule format
    recipients: { type: 'text[]', notNull: true },
    format: { type: 'text', notNull: true }, // 'pdf' or 'excel'
    subject: { type: 'text' },
    message: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Create notifications table
  pgm.createTable('notifications', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    user_id: { type: 'uuid', notNull: true },
    title: { type: 'text', notNull: true },
    content: { type: 'text', notNull: true },
    type: { type: 'text', notNull: true },
    read: { type: 'boolean', notNull: true, default: false },
    link: { type: 'text' },
    reference_id: { type: 'uuid' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Create index on notifications
  pgm.createIndex('notifications', 'user_id');
  pgm.createIndex('notifications', 'read');
  pgm.createIndex('notifications', 'created_at');

  // Create user_tutorials table
  pgm.createTable('user_tutorials', {
    user_id: { type: 'uuid', notNull: true },
    tutorial_key: { type: 'text', notNull: true },
    completed: { type: 'boolean', notNull: true, default: false },
    completed_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Add primary key to user_tutorials
  pgm.addConstraint('user_tutorials', 'pk_user_tutorials', {
    primaryKey: ['user_id', 'tutorial_key']
  });

  // Create extensions for full-text search
  pgm.createExtension('pg_trgm', { ifNotExists: true });
};

exports.down = (pgm) => {
  // Drop tables in reverse order of creation (to handle foreign key constraints)
  pgm.dropTable('user_tutorials');
  pgm.dropTable('notifications');
  pgm.dropTable('report_schedules');
  pgm.dropTable('report_templates');
  pgm.dropTable('reports');
  pgm.dropTable('user_availability');
  pgm.dropTable('documents');
  pgm.dropTable('chat_messages');
  pgm.dropTable('analytics_forecasts');
  pgm.dropTable('analytics_configs');

  // Drop extensions
  pgm.dropExtension('pg_trgm');
  pgm.dropExtension('uuid-ossp');
}; 