import { TIMEZONE } from '../../../src/common/constants/timezone.constant';

describe('Timezone Constant', () => {
  describe('Constant Structure', () => {
    it('should be defined', () => {
      expect(TIMEZONE).toBeDefined();
    });

    it('should have NAME property', () => {
      expect(TIMEZONE.NAME).toBeDefined();
    });

    it('should have DESCRIPTION property', () => {
      expect(TIMEZONE.DESCRIPTION).toBeDefined();
    });

    it('should be a constant object', () => {
      expect(typeof TIMEZONE).toBe('object');
    });
  });

  describe('NAME Property', () => {
    it('should be America/Buenos_Aires', () => {
      expect(TIMEZONE.NAME).toBe('America/Buenos_Aires');
    });

    it('should be a string', () => {
      expect(typeof TIMEZONE.NAME).toBe('string');
    });

    it('should be a valid IANA timezone identifier', () => {
      expect(TIMEZONE.NAME).toMatch(/^[A-Za-z_]+\/[A-Za-z_]+$/);
    });

    it('should not be empty', () => {
      expect(TIMEZONE.NAME).toBeTruthy();
      expect(TIMEZONE.NAME.length).toBeGreaterThan(0);
    });
  });

  describe('DESCRIPTION Property', () => {
    it('should be UTC-3', () => {
      expect(TIMEZONE.DESCRIPTION).toBe('UTC-3');
    });

    it('should be a string', () => {
      expect(typeof TIMEZONE.DESCRIPTION).toBe('string');
    });

    it('should contain UTC', () => {
      expect(TIMEZONE.DESCRIPTION).toContain('UTC');
    });

    it('should not be empty', () => {
      expect(TIMEZONE.DESCRIPTION).toBeTruthy();
      expect(TIMEZONE.DESCRIPTION.length).toBeGreaterThan(0);
    });
  });

  describe('Immutability', () => {
    it('should be readonly (const assertion)', () => {
      // TypeScript enforces readonly at compile time
      expect(TIMEZONE).toBeDefined();
    });

    it('should maintain consistent values', () => {
      // Verify that the constant maintains its values throughout the test suite
      expect(TIMEZONE.NAME).toBe('America/Buenos_Aires');
      expect(TIMEZONE.DESCRIPTION).toBe('UTC-3');
      
      // TypeScript 'as const' provides compile-time immutability
      // Runtime immutability would require Object.freeze()
      expect(typeof TIMEZONE).toBe('object');
    });
  });

  describe('Usage', () => {
    it('should be usable in configuration', () => {
      const config = {
        timezone: TIMEZONE.NAME,
        description: TIMEZONE.DESCRIPTION,
      };

      expect(config.timezone).toBe('America/Buenos_Aires');
      expect(config.description).toBe('UTC-3');
    });

    it('should work with moment-timezone', () => {
      const moment = require('moment-timezone');
      moment.tz.setDefault(TIMEZONE.NAME);

      const currentTime = moment.tz(TIMEZONE.NAME);
      expect(currentTime).toBeDefined();
      expect(currentTime.tz()).toBe(TIMEZONE.NAME);
    });

    it('should be usable in function parameters', () => {
      const formatTimezone = (name: string, desc: string): string => {
        return `${name} (${desc})`;
      };

      const result = formatTimezone(TIMEZONE.NAME, TIMEZONE.DESCRIPTION);
      expect(result).toBe('America/Buenos_Aires (UTC-3)');
    });

    it('should be destructurable', () => {
      const { NAME, DESCRIPTION } = TIMEZONE;
      expect(NAME).toBe('America/Buenos_Aires');
      expect(DESCRIPTION).toBe('UTC-3');
    });
  });

  describe('Timezone Information', () => {
    it('should represent Argentina timezone', () => {
      expect(TIMEZONE.NAME).toContain('Buenos_Aires');
    });

    it('should represent UTC-3 offset', () => {
      expect(TIMEZONE.DESCRIPTION).toBe('UTC-3');
    });

    it('should be consistent naming', () => {
      expect(TIMEZONE.NAME.split('/')[0]).toBe('America');
      expect(TIMEZONE.NAME.split('/')[1]).toBe('Buenos_Aires');
    });
  });

  describe('Export Type', () => {
    it('should be exported as const', () => {
      expect(TIMEZONE).toBeDefined();
      expect(Object.isFrozen(TIMEZONE)).toBe(false); // as const doesn't freeze at runtime
    });

    it('should have correct property count', () => {
      const keys = Object.keys(TIMEZONE);
      expect(keys).toHaveLength(2);
      expect(keys).toContain('NAME');
      expect(keys).toContain('DESCRIPTION');
    });

    it('should not have additional properties', () => {
      const keys = Object.keys(TIMEZONE);
      expect(keys).not.toContain('OFFSET');
      expect(keys).not.toContain('REGION');
    });
  });
});

