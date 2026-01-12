/**
 * Web3 Error Handling Utilities
 */

export class Web3Error extends Error {
  constructor(
    message: string,
    public code?: string,
    public data?: any
  ) {
    super(message);
    this.name = 'Web3Error';
  }
}

export class TransactionError extends Web3Error {
  constructor(
    message: string,
    public hash?: `0x${string}`,
    code?: string,
    data?: any
  ) {
    super(message, code, data);
    this.name = 'TransactionError';
  }
}

export class ContractError extends Web3Error {
  constructor(
    message: string,
    public contractAddress?: string,
    code?: string,
    data?: any
  ) {
    super(message, code, data);
    this.name = 'ContractError';
  }
}

/**
 * Parse and format common Web3 errors
 */
export function parseWeb3Error(error: unknown): Error {
  if (error instanceof Error) {
    // User rejected transaction
    if (error.message.includes('User rejected') || error.message.includes('user rejected')) {
      return new Web3Error('Transaction was rejected by user', 'USER_REJECTED');
    }

    // Insufficient funds
    if (error.message.includes('insufficient funds') || error.message.includes('Insufficient')) {
      return new Web3Error('Insufficient funds for transaction', 'INSUFFICIENT_FUNDS');
    }

    // Network error
    if (error.message.includes('network') || error.message.includes('Network')) {
      return new Web3Error('Network error. Please check your connection.', 'NETWORK_ERROR');
    }

    // Gas estimation error
    if (error.message.includes('gas') || error.message.includes('Gas')) {
      return new Web3Error('Gas estimation failed. Transaction may fail.', 'GAS_ESTIMATION_ERROR');
    }

    // Contract error
    if (error.message.includes('execution reverted')) {
      const revertReason = error.message.match(/execution reverted: (.+)/)?.[1] || 'Transaction reverted';
      return new ContractError(revertReason, undefined, 'EXECUTION_REVERTED');
    }

    return error;
  }

  return new Web3Error('Unknown error occurred', 'UNKNOWN_ERROR');
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  const parsed = parseWeb3Error(error);
  return parsed.message;
}

/**
 * Check if error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  const parsed = parseWeb3Error(error);
  
  if (parsed instanceof Web3Error) {
    return parsed.code !== 'USER_REJECTED' && parsed.code !== 'INSUFFICIENT_FUNDS';
  }

  return true;
}
