// app/first-login/change-password/page.tsx
'use client'

import { showToast } from '@/app/components/sweetalert/sweetalert';
import { Button, Label, TextInput, Card, Spinner } from 'flowbite-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { IconPassword, IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react';
import Swal from 'sweetalert2';

export default function FirstLoginChangePasswordPage() {
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [passwordErrors, setPasswordErrors] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const { data: session, update, status } = useSession();
    const router = useRouter();

    if (status === 'loading' || !session) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <Spinner size="xl" />
            </div>
        );
    }


    // Password validation function
    const validatePassword = (password: string): string => {
        if (password.length === 0) return '';
        if (password.length < 8) {
            return 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
        }
        if (!/[A-Z]/.test(password)) {
            return 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว';
        }
        if (!/[a-z]/.test(password)) {
            return 'รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว';
        }
        if (!/[0-9]/.test(password)) {
            return 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว';
        }
        return '';
    };

    // Check password strength
    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, text: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) return { strength: 33, text: 'อ่อน', color: 'bg-red-500' };
        if (strength <= 4) return { strength: 66, text: 'ปานกลาง', color: 'bg-yellow-500' };
        return { strength: 100, text: 'แข็งแรง', color: 'bg-green-500' };
    };

    // Handle new password change
    const handleNewPasswordChange = (value: string) => {
        setNewPassword(value);
        const error = validatePassword(value);
        setPasswordErrors(prev => ({ ...prev, newPassword: error }));

        if (confirmPassword) {
            if (value !== confirmPassword) {
                setPasswordErrors(prev => ({ ...prev, confirmPassword: 'รหัสผ่านไม่ตรงกัน' }));
            } else {
                setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
            }
        }
    };

    // Handle confirm password change
    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        if (value && newPassword !== value) {
            setPasswordErrors(prev => ({ ...prev, confirmPassword: 'รหัสผ่านไม่ตรงกัน' }));
        } else {
            setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newPasswordError = validatePassword(newPassword);
        if (newPasswordError) {
            setPasswordErrors(prev => ({ ...prev, newPassword: newPasswordError }));
            setIsSubmitting(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordErrors(prev => ({ ...prev, confirmPassword: 'รหัสผ่านไม่ตรงกัน' }));
            setIsSubmitting(false);
            return;
        }

        try {
            const formdata = new FormData();
            formdata.append('newPassword', newPassword);
            formdata.append('confirmPassword', confirmPassword)
            const res = await fetch(`/api/users/${session.user.id}/first-changepassword`, {
                method: "PUT",
                body: formdata
            });

            const data = await res.json();

            if (res.ok) {
                showToast(data.message, data.type);
                // อัพเดท session
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        is_first_login: false,
                        skip_password_change: null,
                    }
                });


            } else {
                showToast(data.message, data.type);
                // router.push("/protected")
            }
        } catch (error) {
            showToast('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = async () => {
        Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: "คุณต้องการข้ามการเปลี่ยนรหัสผ่านในครั้งนี้หรือไม่",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#2563EB',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'ใช่, ข้ามไปก่อน',
            cancelButtonText: 'ยกเลิก',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`/api/users/${session.user.id}/skip-password`, {
                        method: "PUT",
                    });
                    const data = await res.json();
                    if (res.ok) {
                        await update({
                            ...session,
                            user: {
                                ...session?.user,
                                skip_password_change: data.skipUntil,
                            }
                        });
                        window.location.href = '/protected';

                    } else {
                        showToast(data.message, data.type);
                    }
                } catch (error) {
                    showToast('เกิดข้อผิดพลาดในการข้ามการเปลี่ยนรหัสผ่าน', 'error');
                }
            }
        });

    };

    const passwordStrength = getPasswordStrength(newPassword);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <Card className="shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                            <IconPassword className="w-10 h-10 text-blue-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            ยินดีต้อนรับเข้าสู่ระบบ
                        </h1>
                        <p className="text-gray-600">
                            กรุณาเปลี่ยนรหัสผ่านของคุณเพื่อความปลอดภัย
                        </p>
                    </div>

                    {/* Alert Box */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <div className="flex items-start">
                            <IconAlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-yellow-800 font-medium">
                                    นี่คือการเข้าใช้งานครั้งแรกของคุณ
                                </p>
                                <p className="text-sm text-yellow-700 mt-1">
                                    เราแนะนำให้คุณเปลี่ยนรหัสผ่านเพื่อความปลอดภัยของบัญชี แต่คุณสามารถข้ามขั้นตอนนี้ไปก่อนได้
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* New Password */}
                        <div>
                            <Label htmlFor="newPassword" className="text-base font-medium mb-2 block">
                                รหัสผ่านใหม่
                            </Label>
                            <TextInput
                                type="password"
                                name="newPassword"
                                placeholder="กรุณากรอกรหัสผ่านใหม่"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => handleNewPasswordChange(e.target.value)}
                                color={passwordErrors.newPassword ? 'failure' : undefined}
                                sizing="lg"
                            />

                            {/* Password Strength Indicator */}
                            {newPassword && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-600">ความแข็งแรงของรหัสผ่าน</span>
                                        <span className={`text-xs font-medium ${passwordStrength.strength === 100 ? 'text-green-600' :
                                            passwordStrength.strength === 66 ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                            {passwordStrength.text}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                            style={{ width: `${passwordStrength.strength}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {passwordErrors.newPassword && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <IconX className="w-4 h-4 mr-1" />
                                    {passwordErrors.newPassword}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <Label htmlFor="confirmPassword" className="text-base font-medium mb-2 block">
                                ยืนยันรหัสผ่านใหม่
                            </Label>
                            <TextInput
                                type="password"
                                name="confirmPassword"
                                placeholder="กรุณายืนยันรหัสผ่านใหม่อีกครั้ง"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                color={passwordErrors.confirmPassword ? 'failure' : undefined}
                                sizing="lg"
                            />
                            {passwordErrors.confirmPassword && (
                                <p className="mt-2 text-sm text-red-600 flex items-center">
                                    <IconX className="w-4 h-4 mr-1" />
                                    {passwordErrors.confirmPassword}
                                </p>
                            )}
                            {confirmPassword && !passwordErrors.confirmPassword && newPassword === confirmPassword && (
                                <p className="mt-2 text-sm text-green-600 flex items-center">
                                    <IconCheck className="w-4 h-4 mr-1" />
                                    รหัสผ่านตรงกัน
                                </p>
                            )}
                        </div>

                        {/* Password Requirements */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 mb-3">
                                รหัสผ่านต้องประกอบด้วย:
                            </p>
                            <ul className="space-y-2">
                                <PasswordRequirement
                                    met={newPassword.length >= 8}
                                    text="อย่างน้อย 8 ตัวอักษร"
                                />
                                <PasswordRequirement
                                    met={/[A-Z]/.test(newPassword)}
                                    text="ตัวอักษรพิมพ์ใหญ่ (A-Z)"
                                />
                                <PasswordRequirement
                                    met={/[a-z]/.test(newPassword)}
                                    text="ตัวอักษรพิมพ์เล็ก (a-z)"
                                />
                                <PasswordRequirement
                                    met={/[0-9]/.test(newPassword)}
                                    text="ตัวเลข (0-9)"
                                />
                            </ul>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isSubmitting || !!passwordErrors.newPassword || !!passwordErrors.confirmPassword || !newPassword || !confirmPassword}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <IconCheck className="w-5 h-5 mr-2" />
                                        เปลี่ยนรหัสผ่าน
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                size="lg"
                                color="gray"
                                onClick={handleSkip}
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                ข้ามไปก่อน
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    คุณสามารถเปลี่ยนรหัสผ่านได้ในภายหลังที่หน้าโปรไฟล์
                </p>
            </div>
        </div>
    );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
    return (
        <li className="flex items-center text-sm">
            {met ? (
                <IconCheck className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
            ) : (
                <IconX className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            )}
            <span className={met ? 'text-green-700' : 'text-gray-600'}>
                {text}
            </span>
        </li>
    );
}