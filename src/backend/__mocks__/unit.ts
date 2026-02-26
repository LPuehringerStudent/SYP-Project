
export interface MockStatement<T = any> {
    all: jest.Mock<T[], []>;
    get: jest.Mock<T | undefined, []>;
    run: jest.Mock<{ changes: number; lastInsertRowid: number | bigint }, []>;
}

export class MockUnit {
    prepare = jest.fn<any, [string, any?]>();

    createMockStatement<T>(overrides: Partial<MockStatement<T>> = {}): MockStatement<T> {
        return {
            all: jest.fn().mockReturnValue([]),
            get: jest.fn().mockReturnValue(undefined),
            run: jest.fn().mockReturnValue({ changes: 1, lastInsertRowid: 1 }),
            ...overrides
        };
    }
}

// Factory function
export const createMockUnit = (): MockUnit => new MockUnit();