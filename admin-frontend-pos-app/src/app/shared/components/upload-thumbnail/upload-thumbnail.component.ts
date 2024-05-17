import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-upload-thumbnail',
  standalone: true,
  imports: [],
  templateUrl: './upload-thumbnail.component.html',
  styleUrl: './upload-thumbnail.component.scss'
})
export class UploadThumbnailComponent {
  @Output() onChanged = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Input() avatarPreview: any;
  messageValidateFile!: string;
  currentFile?: File;

  onFileChanged(event: any) {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const file: File | null = selectedFiles.item(0);

      const allowedTypes = ['image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(selectedFiles.item(0).type)) {
        // Hiển thị thông báo lỗi
        this.messageValidateFile = 'Invalid file type. Please select a PNG, JPG, or JPEG file.';
        return;
      }

      if (file) {
        this.avatarPreview = '';
        this.currentFile = file;

        const reader = new FileReader();

        reader.onload = (e: any) => {
          this.avatarPreview = e.target.result;
        };
        reader.readAsDataURL(this.currentFile);
      }
    }
    this.onChanged.emit(this.currentFile);
  }

  onRemoveFile() {
    this.onDelete.emit();
  }
}
