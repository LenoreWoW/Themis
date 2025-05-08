const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

class User extends Model {
  // Method to check password correctness
  async checkPassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Get full name
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 100]
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roles: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      validate: {
        isValidRole(value) {
          const allowedRoles = [
            'PROJECT_MANAGER',
            'SUB_PMO',
            'MAIN_PMO',
            'DEPARTMENT_DIRECTOR',
            'EXECUTIVE',
            'ADMIN'
          ];
          
          if (value.length > 0) {
            for (const role of value) {
              if (!allowedRoles.includes(role)) {
                throw new Error(`Invalid role: ${role}`);
              }
            }
          }
        }
      }
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false
    },
    forcePasswordChange: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    passwordChangedAt: {
      type: DataTypes.DATE
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    modelName: 'User',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    hooks: {
      beforeSave: async (user) => {
        // Only hash the password if it's modified (or new)
        if (!user.changed('password')) return;
        
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        
        // Update passwordChangedAt field
        if (user.changed('password') && user.isNewRecord === false) {
          user.passwordChangedAt = new Date(Date.now() - 1000); // Subtract 1 second
        }
      }
    }
  }
);

module.exports = User; 