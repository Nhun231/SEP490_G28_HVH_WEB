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
    // Backend expects { requests: [...] } structure even for single create
    const response = await fetch('http://localhost:8080/api/v1/host/create-account', {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ requests: [body] })
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

    // Check if response contains error message (even with 200 status)
    let errorMessage = '';
    
    // Check in raw text
    if (rawText && (
      rawText.includes('Email đã được sử dụng') ||
      rawText.includes('email') && rawText.includes('đã tồn tại') ||
      rawText.includes('already exists') ||
      rawText.includes('duplicate')
    )) {
      errorMessage = rawText;
    }
    
    // Check in parsed data
    if (!errorMessage && data) {
      if (data.message && typeof data.message === 'string') {
        const msg = data.message.toLowerCase();
        if (msg.includes('email') && (
          msg.includes('đã được sử dụng') ||
          msg.includes('đã tồn tại') ||
          msg.includes('already exists') ||
          msg.includes('duplicate')
        )) {
          errorMessage = data.message;
        }
      }
      if (!errorMessage && data.error) {
        errorMessage = data.error;
      }
    }

    // If error detected, return error response
    if (errorMessage) {
      console.log('Error detected in response:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Check HTTP status
    if (!response.ok) {
      let fallbackError = 'Failed to create host account';
      
      if (data.message) {
        fallbackError = data.message;
      } else if (data.error) {
        fallbackError = data.error;
      } else if (typeof data === 'string') {
        fallbackError = data;
      }
      
      return NextResponse.json(
        { error: fallbackError },
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
