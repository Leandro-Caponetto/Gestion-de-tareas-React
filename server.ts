import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer, loadEnv } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { jsPDF } from "jspdf";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const mode = process.env.NODE_ENV || 'development';
  const env = loadEnv(mode, process.cwd(), '');
  
  const app = express();
  app.use(express.json()); // Support JSON bodies

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Automation Endpoint
  app.post("/api/automate-tasks", async (req, res) => {
    const { tasks, userEmail, bannerImage } = req.body;

    try {
      // 1. Generate PDF
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Registro de Tareas - Correo Argentino", 20, 20);
      doc.setFontSize(12);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text("------------------------------------------", 20, 35);

      let y = 45;
      tasks.forEach((task: any, index: number) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${index + 1}. [${task.estado}] ${task.proyecto}`, 20, y);
        doc.text(`   Descripción: ${task.descripcion || task.tarea || 'Sin descripción'}`, 20, y + 5);
        y += 15;
      });

      const pdfBase64 = doc.output("datauristring");

      // 2. Generate Summary with Gemini
      let summaryText = "Se han procesado y completado todas las tareas del día exitosamente.";
      
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "" });
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        
        const prompt = `Genera un resumen ejecutivo breve y profesional (máximo 100 palabras) para un email sobre las siguientes tareas realizadas en Correo Argentino:\n${JSON.stringify(tasks)}\nEl tono debe ser formal y eficiente.`;
        
        const result = await model.generateContent(prompt);
        const summary = result.response.text;
        if (summary) {
          summaryText = summary;
        }
      } catch (geminiError) {
        console.error("Gemini summary generation failed, using default text:", geminiError);
      }

      // 3. Setup Mailer
      const gmailUser = env.GMAIL_USER || env.VITE_GMAIL_USER || process.env.GMAIL_USER || process.env.VITE_GMAIL_USER || "caponettopeppers@gmail.com";
      const gmailPass = env.GMAIL_APP_PASSWORD || env.VITE_GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD || process.env.VITE_GMAIL_APP_PASSWORD;

      if (!gmailPass) {
        console.warn("GMAIL_APP_PASSWORD is not set. Returning PDF for manual download.");
        return res.json({ 
          success: false, 
          error: "Configuración incompleta: Falta GMAIL_APP_PASSWORD en los Secretos de AI Studio.",
          pdfData: pdfBase64,
          instructions: "Para enviar correos automáticamente, ve a 'Settings' -> 'Secrets' y añade GMAIL_APP_PASSWORD con tu contraseña de aplicación de Google."
        });
      }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      // Verify connection configuration
      try {
        console.log("Verifying transporter...");
        await transporter.verify();
        console.log("Mail server is ready");
      } catch (verifyError: any) {
        console.error("Transporter verify failed:", verifyError);
        throw new Error(`Error de conexión con Gmail: ${verifyError.message}. Revisa tu GMAIL_APP_PASSWORD.`);
      }

      const targetEmail = userEmail || "caponettopeppers@gmail.com";
      
      // Construct HTML Email
      const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1e293b;">
          ${bannerImage ? `<img src="cid:bannerImage" style="width: 100%; height: auto; display: block;" alt="Correo Argentino AI Banner">` : ''}
          <div style="padding: 32px; background-color: #ffffff;">
            <h1 style="color: #003399; margin-top: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.5px;">Reporte de Automatización</h1>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">Hola,</p>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">Aquí tienes el resumen ejecutivo de las tareas procesadas hoy por el Asistente IA:</p>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #ffce00; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; font-style: italic; color: #334155; font-size: 15px;">"${summaryText}"</p>
            </div>

            <p style="font-size: 16px; line-height: 1.6; color: #475569;">Adjunto encontrarás el registro detallado en formato PDF con el desglose completo de cada actividad.</p>
            
            <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #94a3b8;">
              <p style="margin: 0;">Saludos cordiales,</p>
              <p style="margin: 4px 0; font-weight: 700; color: #003399;">Asistente IA - Correo Argentino</p>
              <p style="margin: 0;">Plataforma de Automatización Inteligente</p>
            </div>
          </div>
          <div style="background-color: #003399; padding: 16px; text-align: center;">
            <p style="margin: 0; color: #ffffff; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">© 2026 Correo Argentino - Todos los derechos reservados</p>
          </div>
        </div>
      `;

      const attachments: any[] = [
        {
          filename: `Tareas_${new Date().toISOString().split('T')[0]}.pdf`,
          content: Buffer.from(doc.output("arraybuffer")),
          contentType: 'application/pdf'
        }
      ];

      if (bannerImage) {
        attachments.push({
          filename: 'banner.png',
          content: bannerImage,
          encoding: 'base64',
          cid: 'bannerImage'
        });
      }

      const mailOptions = {
        from: `"Asistente Correo Argentino" <${gmailUser}>`,
        to: targetEmail,
        subject: "✅ Reporte de Automatización - Correo Argentino",
        html: htmlContent,
        attachments: attachments,
      };

      console.log(`Sending email to: ${targetEmail}`);
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      
      res.json({ 
        success: true, 
        message: "Email enviado con éxito",
        messageId: info.messageId
      });
    } catch (error: any) {
      console.error("Error in automation route:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Error desconocido en el servidor" 
      });
    }
  });

  // Track users in rooms
  const rooms: { [key: string]: { [key: string]: { userId: string, displayName: string, socketId: string, avatarUrl?: string } } } = {};

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId, userId, displayName, avatarUrl) => {
      socket.join(roomId);
      
      if (!rooms[roomId]) rooms[roomId] = {};
      rooms[roomId][socket.id] = { userId, displayName, socketId: socket.id, avatarUrl };

      // Send current user list to the new joiner
      const userList = Object.values(rooms[roomId]).filter(u => u.socketId !== socket.id);
      socket.emit("user-list", userList);

      // Notify others
      socket.to(roomId).emit("user-connected", userId, displayName, socket.id, avatarUrl);
      
      socket.on("disconnect", () => {
        if (rooms[roomId]) {
          delete rooms[roomId][socket.id];
          if (Object.keys(rooms[roomId]).length === 0) delete rooms[roomId];
        }
        socket.to(roomId).emit("user-disconnected", userId);
      });
    });

    // Chat messages
    socket.on("send-message", (data) => {
      io.to(data.roomId).emit("new-message", data);
    });

    socket.on("message-read", (data) => {
      socket.to(data.roomId).emit("message-read", data);
    });

    socket.on("typing", (data) => {
      socket.to(data.roomId).emit("typing", {
        userId: data.userId,
        userName: data.userName,
        isTyping: data.isTyping
      });
    });

    // WebRTC Signaling
    socket.on("offer", (data) => {
      io.to(data.target).emit("offer", {
        offer: data.offer,
        sender: socket.id,
        senderName: data.senderName
      });
    });

    socket.on("answer", (data) => {
      io.to(data.target).emit("answer", {
        answer: data.answer,
        sender: socket.id
      });
    });

    socket.on("ice-candidate", (data) => {
      io.to(data.target).emit("ice-candidate", {
        candidate: data.candidate,
        sender: socket.id
      });
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
