/**
 * PHP Integration for ClockWork Gamers
 * 
 * This module allows executing PHP scripts from the Node.js server using child_process.
 * It provides a bridge between the Express API and the PHP functionality.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { Request, Response } from 'express';
import { log } from './vite';

const execAsync = promisify(exec);

/**
 * Executes a PHP script with given arguments and returns the output
 */
export async function executePhpScript(scriptPath: string, args: string[] = []): Promise<any> {
  try {
    const command = `php ${scriptPath} ${args.join(' ')}`;
    log(`Executing PHP command: ${command}`, 'php-integration');
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stderr) {
      log(`PHP Error: ${stderr}`, 'php-integration');
      throw new Error(stderr);
    }
    
    try {
      // Try to parse as JSON
      return JSON.parse(stdout);
    } catch (e) {
      // If not JSON, return raw output
      return stdout;
    }
  } catch (error: any) {
    log(`Failed to execute PHP script: ${error.message}`, 'php-integration');
    throw error;
  }
}

/**
 * API endpoint to generate a database report
 */
export async function handleDbReport(req: Request, res: Response) {
  try {
    const result = await executePhpScript('./php_scripts/db_utilities.php', ['report']);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * API endpoint to run a custom database query
 */
export async function handleDbQuery(req: Request, res: Response) {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }
    
    // Escape query for shell command
    const escapedQuery = query.replace(/"/g, '\\"');
    
    const result = await executePhpScript('./php_scripts/db_utilities.php', ['query', `"${escapedQuery}"`]);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * API endpoint to generate user activity report
 */
export async function handleUserActivityReport(req: Request, res: Response) {
  try {
    const result = await executePhpScript('./php_scripts/user_utilities.php', ['activity']);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * API endpoint to generate referral report
 */
export async function handleReferralReport(req: Request, res: Response) {
  try {
    const result = await executePhpScript('./php_scripts/user_utilities.php', ['referrals']);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * API endpoint to reset a user's password (admin only)
 */
export async function handlePasswordReset(req: Request, res: Response) {
  try {
    const { userId, newPasswordHash } = req.body;
    
    if (!userId || !newPasswordHash) {
      return res.status(400).json({
        success: false,
        error: 'User ID and new password hash are required'
      });
    }
    
    // Escape parameters for shell command
    const escapedHash = newPasswordHash.replace(/"/g, '\\"');
    
    const result = await executePhpScript('./php_scripts/user_utilities.php', [
      'reset-password',
      userId.toString(),
      `"${escapedHash}"`
    ]);
    
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Middleware to serve the PHP admin panel
 */
export function servePhpAdminPanel(req: Request, res: Response) {
  try {
    // This would normally redirect to a PHP server or use a PHP execution engine
    // For demonstration, we'll just inform the user that this would be handled by PHP
    res.send(`
      <html>
        <head>
          <title>PHP Admin Panel</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              line-height: 1.6;
              background: #0f172a;
              color: #f8fafc;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background: #1e293b;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            h1 {
              color: #f97316;
            }
            
            pre {
              background: #334155;
              padding: 15px;
              border-radius: 4px;
              overflow-x: auto;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>PHP Admin Panel Integration</h1>
            <p>In a production environment, this request would be handled by a PHP server.</p>
            <p>The PHP admin panel is available at <code>php_scripts/admin_panel.php</code> and can be accessed directly when deployed to a server with PHP support.</p>
            <p>For now, you can use the React-based admin interface available in this application.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}