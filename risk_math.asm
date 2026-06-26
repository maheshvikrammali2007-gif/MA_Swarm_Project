section .data
    clause_msg db "AMDS Assembly risk weight core initialized", 10, 0
    risk_score dq 0.85

section .text
    global main
    extern printf

main:
    ; Standard x86_64 stack frame setup
    push rbp
    mov rbp, rsp

    ; Print initialization message
    mov rdi, clause_msg
    xor rax, rax
    call printf

    ; Standard program exit
    mov rsp, rbp
    pop rbp
    mov rax, 60         ; sys_exit system call number
    xor rdi, rdi        ; exit code 0
    syscall
