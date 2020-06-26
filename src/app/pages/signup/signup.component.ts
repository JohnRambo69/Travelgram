import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/auth.service';

import { NgForm } from '@angular/forms';

import { finalize } from 'rxjs/operators';

import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFireDatabase } from '@angular/fire/database'

import { readAndCompressImage } from 'browser-image-resizer';

import { imageConfig } from 'src/utils/config';
import {v4 as uuidv4 } from 'uuid';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  picture: string = "https://w0.pngwave.com/png/812/997/face-smiley-emoticon-omg-png-clip-art.png";


  uploadPercent: number = null;

  constructor(private auth: AuthService, 
    private router: Router, 
    private db: AngularFireDatabase, 
    private storage: AngularFireStorage, 
    private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  onSubmit(f: NgForm) {

    const {email, password, username, country, bio, name} = f.form.value;

    this.auth.signUp(email, password)
    .then((res) => {
      console.log(res);
      const {uid} = res.user;

      this.db.object(`/users/${uid}`)
      .set({
        id: uid,
        name: name,
        email: email,
        userName: username,
        country: country,
        bio: bio,
        picture: this.picture

      })
    })
    .then(() => {
      this.router.navigateByUrl("/");
      this.toastr.success('Sign up success');
    })
    .catch((err) => {
      this.toastr.error("Sign up fail");
    });

  }

  async uploadFile(event) {
    const file = event.target.files[0];

    

    let resizedImage = await readAndCompressImage(file, imageConfig);

    const filePath = uuidv4();
    const fileRef = this.storage.ref(filePath);

    const task = this.storage.upload(filePath, resizedImage);

    task.percentageChanges().subscribe((percentage) =>{
      this.uploadPercent = percentage;
    });

    task.snapshotChanges()
    .pipe(
      finalize(() => {
      fileRef.getDownloadURL().subscribe((url) => {
        this.picture = url;
        this.toastr.success("Image upload success")
      });

    })
    ).subscribe();

  }


}
