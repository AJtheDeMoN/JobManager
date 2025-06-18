import { fetchJobs } from './JobService';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';

export const downloadJobsAsPdf = async () => {
  try {
    const jobs = await fetchJobs();

    let htmlContent = `<h2>Job Records</h2><pre>`;
    for (const job of jobs) {
      htmlContent += `${job.job_name}, ${job.customer_name}, ${job.contact_number}, ₹${job.total_amount}, ₹${job.advanced_amount}\n`;
    }
    htmlContent += `</pre>`;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });

    // Copy PDF to a safe location
    const pdfPath = FileSystem.documentDirectory + 'JobReport.pdf';
    await FileSystem.copyAsync({ from: uri, to: pdfPath });

    Alert.alert('Success', 'PDF saved inside app documents folder.');

    // Optional: test open/download
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(pdfPath);
    }

  } catch (err) {
    console.error("PDF generation failed:", err);
    Alert.alert('Error', 'Failed to generate PDF.');
  }
};