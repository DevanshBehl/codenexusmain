import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../utils/api-response.js";
import { z } from "zod";

export const sendMailSchema = z.object({
    body: z.object({
        to: z.string().email("Valid email required"),
        subject: z.string().min(1, "Subject is required"),
        body: z.string().min(1, "Body is required"),
    })
});

export const sendMail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Paused functioning: We skip the actual SMTP transport layer
        const { to, subject, body } = req.body;
        
        // Mock success
        res.status(200).json(new ApiResponse(200, {
            status: "QUEUED",
            recipient: to,
            note: "Mailing functionality is paused. Check SMTP config."
        }, "Email queued successfully"));
    } catch (e) {
        next(e);
    }
}
