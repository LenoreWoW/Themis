exports.shorthands = {
  uuid: { type: 'uuid' },
  timestamptz: { type: 'timestamptz', notNull: true, default: 'now()' },
  text: { type: 'text' },
  jsonb: { type: 'jsonb' },
};

exports.up = (pgm) => {
  // 1. Add severity and deadline fields to tasks
  pgm.addColumns('tasks', {
    severity: {
      type: 'text',
      notNull: true,
      default: 'medium', 
      check: "severity IN ('high', 'medium', 'low')"
    },
    deadline: { type: 'timestamptz' }
  });

  // 2. Add severity and deadline fields to assignments
  pgm.addColumns('assignments', {
    severity: {
      type: 'text',
      notNull: true,
      default: 'medium', 
      check: "severity IN ('high', 'medium', 'low')"
    },
    deadline: { type: 'timestamptz' }
  });

  // 3. Add severity and deadline fields to action_items
  pgm.addColumns('action_items', {
    severity: {
      type: 'text',
      notNull: true,
      default: 'medium', 
      check: "severity IN ('high', 'medium', 'low')"
    },
    deadline: { type: 'timestamptz' }
  });

  // 4. Add start_date and end_date to projects
  pgm.addColumns('projects', {
    start_date: { type: 'timestamptz' },
    end_date: { type: 'timestamptz' }
  });

  // 5. Create meetings table
  pgm.createTable('meetings', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    title: { type: 'text', notNull: true },
    description: { type: 'text' },
    start_time: { type: 'timestamptz', notNull: true },
    end_time: { type: 'timestamptz', notNull: true },
    project_id: { type: 'uuid', references: 'projects' },
    created_by: { type: 'uuid', notNull: true },
    meeting_link: { type: 'text' },
    attendees: { type: 'jsonb' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });

  // 6. Create user_settings table
  pgm.createTable('user_settings', {
    user_id: { type: 'uuid', primaryKey: true },
    auto_organize: { type: 'boolean', notNull: true, default: false },
    theme_preference: { type: 'text', default: 'light' },
    notification_preferences: { type: 'jsonb' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });

  // 7. Create availability_slots table
  pgm.createTable('availability_slots', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    user_id: { type: 'uuid', notNull: true },
    start_time: { type: 'timestamptz', notNull: true },
    end_time: { type: 'timestamptz', notNull: true },
    service_type: { type: 'text', notNull: true, default: 'built-in' },
    external_link: { type: 'text' },
    recurring: { type: 'boolean', notNull: true, default: false },
    recurrence_rule: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });

  // 8. Create bookings table
  pgm.createTable('bookings', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('uuid_generate_v4()') },
    slot_id: { type: 'uuid', notNull: true, references: 'availability_slots' },
    meeting_id: { type: 'uuid', references: 'meetings' },
    name: { type: 'text', notNull: true },
    email: { type: 'text', notNull: true },
    meeting_link: { type: 'text' },
    notes: { type: 'text' },
    status: { 
      type: 'text', 
      notNull: true, 
      default: 'confirmed',
      check: "status IN ('confirmed', 'cancelled', 'rescheduled')"
    },
    booked_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') }
  });

  // Create indexes
  pgm.createIndex('meetings', 'project_id');
  pgm.createIndex('meetings', 'created_by');
  pgm.createIndex('meetings', 'start_time');
  pgm.createIndex('meetings', 'end_time');
  
  pgm.createIndex('availability_slots', 'user_id');
  pgm.createIndex('availability_slots', 'start_time');
  pgm.createIndex('availability_slots', 'end_time');
  
  pgm.createIndex('bookings', 'slot_id');
  pgm.createIndex('bookings', 'meeting_id');
  pgm.createIndex('bookings', 'email');
  pgm.createIndex('bookings', 'booked_at');
};

exports.down = (pgm) => {
  // Drop tables in reverse order
  pgm.dropTable('bookings');
  pgm.dropTable('availability_slots');
  pgm.dropTable('user_settings');
  pgm.dropTable('meetings');
  
  // Remove columns from existing tables
  pgm.dropColumns('projects', ['start_date', 'end_date']);
  pgm.dropColumns('action_items', ['severity', 'deadline']);
  pgm.dropColumns('assignments', ['severity', 'deadline']);
  pgm.dropColumns('tasks', ['severity', 'deadline']);
}; 