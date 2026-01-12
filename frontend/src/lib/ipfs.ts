/**
 * IPFS Integration Utilities
 * Using IPFS HTTP Client for decentralized storage
 */

import { create } from 'ipfs-http-client';

// Initialize IPFS client
// Using public gateway or custom endpoint
const ipfsEndpoint = process.env.NEXT_PUBLIC_IPFS_ENDPOINT || 'https://ipfs.io';
const ipfsApiKey = process.env.NEXT_PUBLIC_IPFS_API_KEY;
const ipfsSecret = process.env.NEXT_PUBLIC_IPFS_SECRET;

let ipfsClient: ReturnType<typeof create> | null = null;

/**
 * Get IPFS client instance
 */
export function getIPFSClient() {
  if (ipfsClient) return ipfsClient;

  try {
    // If using Pinata or other service with auth
    if (ipfsApiKey && ipfsSecret) {
      ipfsClient = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: `Basic ${Buffer.from(`${ipfsApiKey}:${ipfsSecret}`).toString('base64')}`,
        },
      });
    } else {
      // Public IPFS gateway
      ipfsClient = create({
        url: `${ipfsEndpoint}/api/v0`,
      });
    }
  } catch (error) {
    console.error('Failed to initialize IPFS client:', error);
    // Fallback to public gateway
    ipfsClient = create({
      url: 'https://ipfs.io/api/v0',
    });
  }

  return ipfsClient;
}

/**
 * Upload file to IPFS
 */
export async function uploadToIPFS(file: File | Blob): Promise<string> {
  try {
    const client = getIPFSClient();
    const fileBuffer = await file.arrayBuffer();
    
    const result = await client.add(new Uint8Array(fileBuffer), {
      pin: true,
    });

    return result.cid.toString();
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error('Failed to upload to IPFS');
  }
}

/**
 * Upload JSON metadata to IPFS
 */
export async function uploadJSONToIPFS(data: Record<string, any>): Promise<string> {
  try {
    const client = getIPFSClient();
    const jsonString = JSON.stringify(data);
    const jsonBuffer = Buffer.from(jsonString);

    const result = await client.add(jsonBuffer, {
      pin: true,
    });

    return result.cid.toString();
  } catch (error) {
    console.error('IPFS JSON upload error:', error);
    throw new Error('Failed to upload JSON to IPFS');
  }
}

/**
 * Get IPFS gateway URL
 */
export function getIPFSGatewayURL(cid: string): string {
  const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
  return `${gateway}${cid}`;
}

/**
 * Upload NFT metadata with image
 */
export async function uploadNFTMetadata(
  name: string,
  description: string,
  imageFile: File | Blob,
  attributes?: Array<{ trait_type: string; value: string | number }>
): Promise<{ imageCID: string; metadataCID: string; metadataURI: string }> {
  try {
    // Upload image first
    const imageCID = await uploadToIPFS(imageFile);
    const imageURL = getIPFSGatewayURL(imageCID);

    // Create metadata
    const metadata = {
      name,
      description,
      image: imageURL,
      ...(attributes && { attributes }),
    };

    // Upload metadata
    const metadataCID = await uploadJSONToIPFS(metadata);
    const metadataURI = getIPFSGatewayURL(metadataCID);

    return {
      imageCID,
      metadataCID,
      metadataURI,
    };
  } catch (error) {
    console.error('NFT metadata upload error:', error);
    throw new Error('Failed to upload NFT metadata');
  }
}

/**
 * Fetch content from IPFS
 */
export async function fetchFromIPFS(cid: string): Promise<Uint8Array> {
  try {
    const url = getIPFSGatewayURL(cid);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('IPFS fetch error:', error);
    throw new Error('Failed to fetch from IPFS');
  }
}

/**
 * Fetch JSON from IPFS
 */
export async function fetchJSONFromIPFS(cid: string): Promise<any> {
  try {
    const data = await fetchFromIPFS(cid);
    const jsonString = new TextDecoder().decode(data);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('IPFS JSON fetch error:', error);
    throw new Error('Failed to fetch JSON from IPFS');
  }
}
