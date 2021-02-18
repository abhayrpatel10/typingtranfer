

function register(event){

    event.preventDefault();
    document.getElementById('spinner').style.display='inline-block';

    var firstName=document.getElementById('first_name').value;
    var lastName=document.getElementById('last_name').value;
    var email=document.getElementById('email').value;
    var password1=document.getElementById('password1').value;
    var password2=document.getElementById('password2').value;

    if(firstName === '' || lastName===' ' || email === '' || password1 ==='' || password2 ===''){
        alert('Please fill all the details')
    }

    if(password1.length < 6){
        alert('Password Length should be greater than 6');
    }

    if(password1 !== password2){
        alert("Passwords don't match !");
    }

    var name=firstName+" "+lastName;

    $.ajax({
        type: 'POST',
        url: 'https://typingdna.herokuapp.com/createuser',
        data: JSON.stringify({
            name:name,
            email:email,
            password:password1
        }),
        success: function(data,status) {

            
            localStorage.setItem('typingdna-token',data.data.token)
            window.location='dashboard.html'
            document.getElementById('spinner').style.display='none';
            localStorage.setItem('status',data.data.status)
            localStorage.setItem('balance',data.data.balance)
            localStorage.setItem('email',data.data.email)
            localStorage.setItem('username',data.data.name)
            
            
            console.log(data)
            console.log(status)
         },
         error:function(data){
            alert(data.responseJSON.data.message);
         },
        contentType: "application/json",
        dataType: 'json'
    });

    
}

function login(event){
    
    event.preventDefault();
    document.getElementById('spinner').style.display='inline-block';
    var email=document.getElementById('email').value;
    var password=document.getElementById('password').value;

    if(email === '' || password === ''){
        alert('Please fill the details')
    }

    $.ajax({
        type: 'POST',
        url: 'https://typingdna.herokuapp.com/login',
        data: JSON.stringify({
            email:email,
            password:password
        }),
        success: function(data) {
            
            document.getElementById('spinner').style.display='none';
            localStorage.setItem('typingdna-token',data.data.token)
            localStorage.setItem('status',data.data.status)
            localStorage.setItem('balance',data.data.balance)
            localStorage.setItem('email',data.data.email)
            localStorage.setItem('username',data.data.name)
            
            window.location='dashboard.html'
            
         },
         error:function(data){
            alert(data.responseJSON.data.message);
         },
        contentType: "application/json",
        dataType: 'json'
    });
    
}

var tdna;
var pattern;

function loadDashboard(){   
    console.log(localStorage.getItem('status'));
    if(localStorage.getItem('status') === 'false'){
        document.getElementById('typingPatternCapture').style.visibility='visible';
    }

    document.getElementById('balance').innerHTML='&#8377 '+localStorage.getItem('balance');

    console.log('text')

    tdna=new TypingDNA();
    tdna.addTarget("verificationtext");
    tdna.addTarget("verificationtextuser");
    tdna.addTarget("verificationtexttransaction");
    tdna.addTarget("verificationtexttransactionform");
    
}

function loadSubmitForm(){
    console.log('text')
    tdna=new TypingDNA();
    tdna.addTarget("verificationtext");
    tdna.addTarget("verificationtextuser");
    tdna.addTarget("verificationtexttransaction");
    tdna.addTarget("verificationtexttransactionform");
}



function savePattern(){
    var text=document.getElementById('verificationtext').value;

    if(text !== 'I agree to the current terms and approve of this transaction'){
        alert("Text doesn't match");
        return;
    }
    pattern=tdna.getTypingPattern({type:2 , targetId:"verificationtext"});
    if(pattern === null){
        alert('Please type and do not paste');
        return;
    }
    var token=localStorage.getItem('typingdna-token')
    $.ajax({
        type: 'POST',
        url: 'https://typingdna.herokuapp.com/capturepattern',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer '+token);
        },
        data: JSON.stringify({
            typingPattern:pattern
        }),
        success: function(data) {
            $('#exampleModalCenter').modal('hide');
            alert('Typing Pattern captured and stored securely.')
            document.getElementById('typingPatternCapture').style.visibility='hidden';
            
            
         },
         error:function(data){
            alert(data.responseJSON.data.message);
         },
        contentType: "application/json",
        dataType: 'json'
    });
    
    
    
}


function verifyPattern(){
    var text=document.getElementById('verificationtextuser').value;

    if(text !== 'I agree to the current terms and approve of this transaction'){
        alert("Text doesn't match");
        return;
    }
    pattern=tdna.getTypingPattern({type:2 , targetId:"verificationtext"});
    if(pattern === null){
        alert('Please type and do not paste');
        return;
    }
    var token=localStorage.getItem('typingdna-token')
    $.ajax({
        type: 'POST',
        url: 'https://typingdna.herokuapp.com/verifyuser',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer '+token);
        },
        data: JSON.stringify({
            typingPattern:pattern
        }),
        success: function(data) {
            $('#exampleModalCenter').modal('hide');
            alert('Typing Pattern matches.Verified Successfully')
            
         },
         error:function(data){
             console.log(data);
            alert(data.responseJSON.data.message);
         },
        contentType: "application/json",
        dataType: 'json'
    });
    
    
    
}

function sendMoney(){
    var text=document.getElementById('verificationtexttransaction').value;

    if(text !== 'I agree to the current terms and approve of this transaction'){
        alert("Text doesn't match");
        return;
    }
    var checkpattern=tdna.getTypingPattern({type:2 , targetId:"verificationtexttransaction"});
    if(pattern === null){
        alert('Please type and do not paste');
        return;
    }
    console.log(pattern)
    var token=localStorage.getItem('typingdna-token');
    var amount=document.getElementById('transactionAmount').value.toString();
    $.ajax({
        type: 'POST',
        url: 'https://typingdna.herokuapp.com/debit',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer '+token);
        },
        data: JSON.stringify({
            typingPattern:checkpattern,
            amount:amount
        }),
        success: function(data) {
            $('#exampleModalTransaction').modal('hide');
            alert('Transaction Successfull');
            
            console.log(data.data.balance)

            localStorage.setItem('balance',data.data.balance)
            localStorage.setItem('status',true);
            

            document.getElementById('balance').innerHTML='&#8377 '+localStorage.getItem('balance');
            
         },
         error:function(data){
             console.log(data);
            alert(data.responseJSON.data.message);
         },
        contentType: "application/json",
        dataType: 'json'
    });
}

function loadProfile(){
    document.getElementById('emailprofile').value=localStorage.getItem('email');
    document.getElementById('nameprofile').value=localStorage.getItem('username');
}

function logout(){
    console.log('logout')
    var token=localStorage.getItem('typingdna-token');
    
    $.ajax({
        type: 'POST',
        url: 'https://typingdna.herokuapp.com/logout',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer '+token);
        },
        success: function(data) {
            localStorage.removeItem('typingdna-token');
            localStorage.removeItem('status');
            localStorage.removeItem('username');
            localStorage.removeItem('balance');
            localStorage.removeItem('email');
            window.location='index.html'
            
         },
         error:function(data){
             console.log(data);
            alert(data.responseJSON.data.message);
         },
        contentType: "application/json",
        dataType: 'json'
    });
}

function submitForm(){
    
    console.log('text')
    var input = document.querySelector('input[type="file"]')
    var token=localStorage.getItem('typingdna-token');
    var checkpattern=tdna.getTypingPattern({type:2 , targetId:"verificationtexttransactionform"});

    var data = new FormData()
    data.append('file', input.files[0])
    data.append('typingPattern',checkpattern)
    
    
    $.ajax({
        type: 'POST',
        url: 'http://localhost:5000/submitform',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer '+token);
        },
        data: data,
        success: function(data) {
            $('#exampleModalTransaction').modal('hide');
            alert('Form Verified and Submitted');
            
            

            
            
            },
            error:function(data){
                console.log(data);
            alert(data.responseJSON.data.message);
            },
            cache: false,
            contentType: false,
            processData: false,
        
    });
    


   
}