import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  email = null;

  constructor(private auth: AuthService, private router: Router, private toastr: ToastrService) {
    auth.getUser().subscribe((user) => {

     this.email = user?.email
     console.log(user);
    });
   }

  ngOnInit(): void {
  }

  async handleSignOut(){
    try {
      await this.auth.signOut();
      this.email = null;
      this.router.navigateByUrl("/signin");
      this.toastr.success("Signed out")

    } catch (error) {
      this.toastr.error("Problem with sign out");
    }
  }

}
