# csshow-signup

Program process flow
1. new attendee fill up the signup form with email.
2. system will insert the information to database with generated code.
3. based on generated code will send the link to specific email.
4. attendee will click the link then update the verified=1 and verified_at=current_date and generate the nickname.
5. insert the information email and nickname into tbl_users.
6. retrieve the email , nickname and generate the token and pass the data to redirecting.html and then redirect to livecast.html with parameter passed. 