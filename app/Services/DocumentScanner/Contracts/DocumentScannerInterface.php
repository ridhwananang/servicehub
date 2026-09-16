<?php

namespace App\Services\DocumentScanner\Contracts;

use App\Services\DocumentScanner\DTOs\ParsedDocumentData;
use Illuminate\Http\UploadedFile;

interface DocumentScannerInterface
{
    /**
     * Scan and extract repair document data from an uploaded image file.
     *
     * @param  UploadedFile  $file
     * @return ParsedDocumentData
     *
     * @throws \App\Services\DocumentScanner\Exceptions\DocumentScannerException
     */
    public function scan(UploadedFile $file): ParsedDocumentData;
}
