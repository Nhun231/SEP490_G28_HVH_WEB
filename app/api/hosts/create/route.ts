import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Prepare headers to forward to backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward cookies
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }
    
    // Forward request to backend API
    const response = await fetch('http://localhost:8080/api/v1/host/create-account', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body)
    });

    // Check content type to determine how to parse response
    const contentType = response.headers.get('content-type');
    let data;
    let rawText = '';
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Backend returns plain text
      rawText = await response.text();
      data = { message: rawText, success: response.ok };
    }

    console.log('Backend response:', { 
      status: response.status, 
      ok: response.ok,
      contentType,
      rawText: rawText || 'N/A',
      data 
    });

    // Check HTTP status
    if (!response.ok) {
      let errorMessage = 'Failed to create host account';
      
      // Extract error message from response
      if (rawText) {
        errorMessage = rawText;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error creating host:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
