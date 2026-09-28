import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const INITIAL_DATA = {
  users: [
    { id: "1", name: "System Admin", username: "admin", password: "123", role: "admin" },
    { id: "2", name: "Warehouse Staff", username: "staff", password: "123", role: "staff" },
    { id: "3", name: "Guest Viewer", username: "viewer", password: "123", role: "viewer" }
  ],
  products: [
    { id: "1", name: "Wireless Mechanical Keyboard", category: "Electronics", price: 89.99, quantity: 25, expiryDate: "2027-12-31", supplier: "TechLogistics", sku: "KB-WL-01" },
    { id: "2", name: "Ergonomic Office Chair", category: "Furniture", price: 249.50, quantity: 8, expiryDate: "2030-01-01", supplier: "ComfortSupply", sku: "CH-ERG-02" },
    { id: "3", name: "Ultra HD 4K Monitor 27-inch", category: "Electronics", price: 320.00, quantity: 3, expiryDate: "2028-06-15", supplier: "ScreenCorp", sku: "MON-4K-27" },
    { id: "4", name: "USB-C Fast Charging Cable", category: "Accessories", price: 12.99, quantity: 0, expiryDate: "2029-01-01", supplier: "CableWorks", sku: "CBL-USBC-04" }
  ],
  orders: [
    { id: "101", productId: "1", quantity: 2, totalPrice: 179.98, date: "2026-09-20", customerName: "Alice Johnson", orderStatus: "COMPLETED" },
    { id: "102", productId: "2", quantity: 1, totalPrice: 249.50, date: "2026-09-22", customerName: "Bob Smith", orderStatus: "COMPLETED" }
  ],
  purchases: [
    { id: "201", productId: "3", quantity: 10, cost: 2400.00, supplier: "ScreenCorp", date: "2026-09-24", status: "PENDING" }
  ],
  alerts: []
};

const KV_KEY = 'inventory_db';

// Global memory cache to maintain state during server runtime
declare global {
  var __globalInventoryDb: any;
}

if (!global.__globalInventoryDb) {
  global.__globalInventoryDb = JSON.parse(JSON.stringify(INITIAL_DATA));
}

// Helper to read data
async function getDbData() {
  // 1. Try Vercel KV if available
  try {
    const kvData = await kv.get(KV_KEY);
    if (kvData) {
      global.__globalInventoryDb = kvData;
      return global.__globalInventoryDb;
    }
  } catch (error) {
    // KV not configured or local environment
  }

  // 2. Return Global In-Memory Store
  return global.__globalInventoryDb;
}

// Helper to write data
async function saveDbData(data: any) {
  global.__globalInventoryDb = data;

  // Persist to Vercel KV if available
  try {
    await kv.set(KV_KEY, data);
  } catch (error) {
    // Fail silently in local development without KV
  }
}

// GET handler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const [resource, id] = resolvedParams.path;
    const data = await getDbData();
    
    const collection = data[resource] || [];

    if (id) {
      const item = collection.find((i: any) => String(i.id) === id);
      if (item) return NextResponse.json(item);
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST handler
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const resource = resolvedParams.path[0];
    const body = await request.json();
    const data = await getDbData();
    
    if (!data[resource]) {
      data[resource] = [];
    }

    // Ensure numeric IDs if needed, otherwise generate a unique one
    const newItem = { 
      id: body.id || Math.random().toString(36).substr(2, 9), 
      ...body 
    };
    
    data[resource].push(newItem);
    await saveDbData(data);
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT handler
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const [resource, id] = resolvedParams.path;
    const body = await request.json();
    const data = await getDbData();

    if (!data[resource] || !id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const index = data[resource].findIndex((i: any) => String(i.id) === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    data[resource][index] = { ...body, id }; 
    await saveDbData(data);

    return NextResponse.json(data[resource][index]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH handler
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const [resource, id] = resolvedParams.path;
    const body = await request.json();
    const data = await getDbData();

    if (!data[resource] || !id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const index = data[resource].findIndex((i: any) => String(i.id) === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    data[resource][index] = { ...data[resource][index], ...body, id };
    await saveDbData(data);

    return NextResponse.json(data[resource][index]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE handler
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const [resource, id] = resolvedParams.path;
    const data = await getDbData();

    if (!data[resource] || !id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const index = data[resource].findIndex((i: any) => String(i.id) === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const deletedItem = data[resource].splice(index, 1);
    await saveDbData(data);

    return NextResponse.json(deletedItem[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

