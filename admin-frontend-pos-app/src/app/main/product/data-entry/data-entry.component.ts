import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute} from "@angular/router";
import {ProductService} from "../../../core/services/product/product.service";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatIcon} from "@angular/material/icon";
import {MatButton} from "@angular/material/button";
import {NgForOf, NgIf} from "@angular/common";
import Editor from '../../../../assets/ckeditor5/build/ckeditor';
import {ChangeEvent, CKEditorModule} from "@ckeditor/ckeditor5-angular";
import {ImageService} from "../../../core/services/image/image.service";
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-data-entry',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatIcon, MatButton, FormsModule, ReactiveFormsModule, NgIf, NgForOf, CKEditorModule],
  templateUrl: './data-entry.component.html',
  styleUrl: './data-entry.component.scss'
})
export class DataEntryComponent implements OnInit {
  formData!: FormGroup;
  errors: any;
  editId!: string | null;
  changed: boolean = false;
  listAction: any = {
    edit: false,
    view: false,
    create: false
  }
  orderedFiles: File[] = [];
  editor = Editor as unknown as {
    create: any;
  };

  config = {};

  content = ``;
  newContent = ``;


  constructor(private _productService: ProductService, private fb: FormBuilder, private spinner: NgxSpinnerService, private toastr: ToastrService, private route: ActivatedRoute, private _imageService: ImageService) {
    this.editId = this.route.snapshot.queryParamMap.get("id");
    this.formData = this.fb.group({
      id: [''],
      price: ['', [Validators.required]],
      name: ['', [Validators.required]]
    });

    if (this.editId) {
      this.getDetail();
      if (this.route.snapshot.routeConfig?.path === 'edit') {
        this.listAction.edit = true;
      } else if (this.route.snapshot.routeConfig?.path === 'detail') {
        this.listAction.view = true;
      }
    } else {
      this.listAction.create = true;
    }
  }

  ngOnInit(): void {
  }

  urls: any = [];

  onSelectFile(event: any) {
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      let indexCounter = this.orderedFiles.length; // Bắt đầu chỉ mục từ vị trí hiện tại của orderedFiles

      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();

        reader.onload = (event: any) => {
          this.urls.push(event.target.result);
        };

        this.orderedFiles.push(event.target.files[i]); // Sử dụng biến đếm để tăng dần chỉ mục
        reader.readAsDataURL(event.target.files[i]);
      }
      console.log(this.orderedFiles)
    }
  }


  create() {
    const formData = new FormData();
    formData.append('name', this.formData.get('name')!.value);
    formData.append('price', this.formData.get('price')!.value);
    formData.append('content', this.content + this.newContent);
    if (this.orderedFiles) {
      for (let i = 0; i < this.orderedFiles.length; i++) {
        formData.append('files', this.orderedFiles[i]);
      }
    }
    this._productService.onCreate(formData).subscribe((res: any) => {
      if (res && res.statusCodeValue === 200) {
        this.toastr.success("Create success", "Success");
      } else if (res.body.errors) {
        this.errors = res.body.errors;
        this.formData.get('name')?.setErrors({'unique': this.errors.name});
      } else {
        this.toastr.success("Error", "Fail");
      }
    })
  }

  update() {
    const formData = new FormData();
    formData.append('id', this.formData.get('id')!.value);
    formData.append('name', this.formData.get('name')!.value);
    formData.append('price', this.formData.get('price')!.value);
    formData.append('content', this.newContent);
    console.log(formData.get('content'))
    if (this.orderedFiles) {
      for (let i = 0; i < this.orderedFiles.length; i++) {
        formData.append('files', this.orderedFiles[i]);
      }
    }
    this._productService.onUpdate(formData).subscribe((res: any) => {
      if (res && res.statusCodeValue === 200) {
        this.toastr.success("Update success", "Success");
      } else if (res.body.errors) {
        this.errors = res.body.errors;
        this.formData.get('name')?.setErrors({'unique': this.errors.name});
      } else {
        this.toastr.success("Error", "Fail");
      }
    })
  }

  submit() {
    if (this.formData.valid) {
      if (this.editId) {
        this.update();

      } else {
        this.create();
      }
    }
  }

  getDetail() {
    this._productService.onGet(this.editId).subscribe((res: any) => {
      if (res) {
        this.formData.get('id')?.setValue(res.body.data.id);
        this.formData.get('name')?.setValue(res.body.data.name);
        this.formData.get('price')?.setValue(res.body.data.price);
        this.content = res.body.data.content;

        for (let i = 0; i < res.body.data.images.length; i++) {
          this.urls.push(environment.MINIO_URL + res.body.data.images[i].fileName);
          this.orderedFiles.push(
            new File(
              [new Blob([res.body.data.images[i].fileName], {type: 'text/plain'})],
              res.body.data.images[i].fileName,
              {type: 'text/plain'}
            )
          );
        }
        console.log(this.orderedFiles)
      }
    })
  }

  removeFile(index: number) {
    this.orderedFiles.splice(index, 1);
    // Xóa phần tử có chỉ mục index từ mảng urls
    this.urls.splice(index, 1);
  }

  onReady(eventData: any) {
    const imageService = this._imageService; // Capture reference to this._imageService
    eventData.plugins.get("FileRepository").createUploadAdapter = function (
      loader: any
    ) {
      console.log(loader)
      // console.log(btoa(loader.file));
      return new UploadAdapter(loader, imageService);
    };
  }

  onChangeContent({editor}: ChangeEvent) {
    this.newContent = editor.getData();
  }

  splitTextFile(url: string){
    const parts = url.split("/");
    const imageNameWithExtension = parts[parts.length - 1]; // Lấy phần cuối cùng của URL
    return imageNameWithExtension.split(".")[0];
  }

    protected readonly environment = environment;
}


export class UploadAdapter {
  private loader?: any;

  constructor(loader: any, private imageService: ImageService) {
    this.loader = loader;
  }

  public upload(): Promise<any> {
    // Thực hiện xử lý upload ảnh và trả về đường dẫn mong muốn
    return new Promise((resolve, reject) => {
      this.loader.file.then((file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        console.log(file)
        this.imageService.onUpload(formData).subscribe((res: any) => {
          if (res && res.statusCodeValue === 200) {
            const temporaryImagePath = environment.MINIO_URL + res.body.data;
            resolve({default: temporaryImagePath});
          }
        })
      });
    });
  }
}
